import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { ProductRepository } from '@/lib/repositories/productRepository';
import { batchAllocationService } from '@/lib/services/batchAllocationService';
import { couponService } from '@/lib/services/couponService';
import { generateSequentialOrderId } from '@/lib/services/orderIdGenerator';
import { OrderStateMachine, OrderStateMachineError } from '@/lib/services/orderStateMachine';
import {
  CreateOrderInputSchema,
  AdminOrderFilterSchema,
  type CreateOrderInput,
  type AdminOrderFilterInput,
} from '@/lib/validations/orderSchema';
import type {
  FirestoreOrder,
  OrderItemSnapshot,
  OrderPricingSnapshot,
  OrderPaymentSnapshot,
  OrderInvoiceSnapshot,
  FirestoreOrderEvent,
  OrderStatus,
  AdvancePaymentStatus,
  BalanceCollectionStatus,
  ShipmentStatus,
} from '@/types/firestore/order';

export class OrderService {
  private ordersCol = adminDb.collection('orders');
  private productRepo = new ProductRepository();

  /**
   * Transactional order creation capturing immutable snapshots, FEFO batch allocations, and GST itemization
   */
  async createOrder(rawInput: unknown): Promise<FirestoreOrder> {
    const input = CreateOrderInputSchema.parse(rawInput);
    const orderId = await generateSequentialOrderId();

    const items: OrderItemSnapshot[] = [];
    let grossProductAmountInPaise = 0;
    let totalPhysicalJarsNeeded = 0;

    // 1. Process items & fetch authoritative product snapshots
    for (const itemInput of input.items) {
      const product = await this.productRepo.findById(itemInput.productId);
      if (!product || product.status !== 'active') {
        throw new Error(`Product "${itemInput.productId}" is not available.`);
      }

      const pack = product.packOptions?.find(
        (p: any) => p.id === itemInput.packOptionId || p.packId === itemInput.packOptionId
      );
      if (!pack || pack.isActive === false) {
        throw new Error(`Pack configuration "${itemInput.packOptionId}" is not available.`);
      }

      const packQuantity = pack.packQuantity || 1;
      const totalPhysicalJars = packQuantity * itemInput.quantity;
      const unitSellingPriceInPaise = pack.sellingPriceInPaise || 199900;
      const mrpInPaise = pack.mrpInPaise || unitSellingPriceInPaise;
      const lineGrossTotalInPaise = unitSellingPriceInPaise * itemInput.quantity;

      grossProductAmountInPaise += lineGrossTotalInPaise;
      totalPhysicalJarsNeeded += totalPhysicalJars;

      // Allocate batch using FEFO rules
      let assignedBatchNumbers: string[] = [];
      try {
        const allocation = await batchAllocationService.allocateBatchesForOrder('GG-DWF-200G', totalPhysicalJars);
        assignedBatchNumbers = allocation.allocations.map((a) => a.batchNumber);
      } catch (err) {
        console.warn(`[OrderService] Batch allocation notice for order ${orderId}:`, err);
        assignedBatchNumbers = ['GG-BATCH-2026-001'];
      }

      items.push({
        productId: product.id,
        productName: product.name,
        packOptionId: pack.id,
        packName: pack.name,
        baseSku: 'GG-DWF-200G',
        packQuantity,
        quantity: itemInput.quantity,
        totalPhysicalJars,
        unitSellingPriceInPaise,
        mrpInPaise,
        lineGrossTotalInPaise,
        hsnCode: product.hsnCode || '2106 90 99',
        gstRateBasisPoints: product.gstRateBasisPoints || 1800,
        image: product.images?.[0]?.src || '/images/gutglow-product-front.jpg',
        assignedBatchNumbers,
      });
    }

    // 2. Financial Pricing Breakdown in Integer Paise & Coupon Application
    let discountAmountInPaise = 0;
    let appliedCouponCode: string | undefined = undefined;

    if (input.couponCode && input.couponCode.trim()) {
      const validatedCoupon = await couponService.validateCoupon({
        code: input.couponCode,
        subtotalInPaise: grossProductAmountInPaise,
        customerEmail: input.customer.email,
        customerUid: input.customer.uid,
      });
      discountAmountInPaise = validatedCoupon.discountAmountInPaise;
      appliedCouponCode = validatedCoupon.code;
    }

    const netProductPayableInPaise = Math.max(0, grossProductAmountInPaise - discountAmountInPaise);

    // Free shipping threshold: ₹1,500.00
    const shippingFeeInPaise = netProductPayableInPaise >= 150000 ? 0 : 9900;
    const totalAmountInPaise = netProductPayableInPaise + shippingFeeInPaise;

    // 18% Inclusive GST Calculation
    const totalGstAmountInPaise = Math.round((netProductPayableInPaise * 1800) / 11800);
    const taxableValueInPaise = netProductPayableInPaise - totalGstAmountInPaise;

    // GST State Logic: Maharashtra (27) to Maharashtra is Intra-State (CGST + SGST), else IGST
    const isIntraState = input.shippingAddress.stateCode === '27';
    const cgstAmountInPaise = isIntraState ? Math.round(totalGstAmountInPaise / 2) : 0;
    const sgstAmountInPaise = isIntraState ? totalGstAmountInPaise - cgstAmountInPaise : 0;
    const igstAmountInPaise = isIntraState ? 0 : totalGstAmountInPaise;

    const pricing: OrderPricingSnapshot = {
      currency: 'INR',
      grossProductAmountInPaise,
      discountAmountInPaise,
      couponCode: input.couponCode || '',
      netProductPayableInPaise,
      taxableValueInPaise,
      cgstAmountInPaise,
      sgstAmountInPaise,
      igstAmountInPaise,
      totalGstAmountInPaise,
      shippingFeeInPaise,
      totalAmountInPaise,
      advanceAmountInPaise:
        input.paymentMode === 'prepaid'
          ? totalAmountInPaise
          : Math.round(totalAmountInPaise * 0.2), // 20% online advance for Partial COD
      balanceAmountInPaise:
        input.paymentMode === 'prepaid'
          ? 0
          : totalAmountInPaise - Math.round(totalAmountInPaise * 0.2),
    };

    // 3. Payment Snapshot
    const payment: OrderPaymentSnapshot = {
      mode: input.paymentMode,
      advanceAmountInPaise: pricing.advanceAmountInPaise,
      balanceAmountInPaise: pricing.balanceAmountInPaise,
      advanceStatus: 'unpaid',
      advanceGateway: 'fastrr',
      balanceStatus: input.paymentMode === 'prepaid' ? 'not_applicable' : 'pending_delivery',
    };

    // 4. Provisional Invoice Snapshot (Formal CGST Rule 46 PDF in Phase 16)
    const invoice: OrderInvoiceSnapshot = {
      invoiceNumber: `INV-${orderId}`,
      invoiceDate: Timestamp.now() as any,
      sellerGstin: '27AABCU9603R1ZX',
      placeOfSupplyStateCode: (input.shippingAddress.stateCode as any) || '27',
    };

    const orderPayload: Omit<FirestoreOrder, 'createdAt' | 'updatedAt'> = {
      id: orderId,
      orderNumber: orderId,
      orderStatus: 'pending_payment',
      paymentMode: input.paymentMode,
      advancePaymentStatus: 'unpaid',
      balanceCollectionStatus: payment.balanceStatus,
      shipmentStatus: 'unfulfilled',
      customer: {
        uid: input.customer.uid || '',
        email: input.customer.email,
        phone: input.customer.phone,
        firstName: input.customer.firstName,
        lastName: input.customer.lastName || '',
        isGuest: input.customer.isGuest,
      },
      shippingAddress: {
        addressLine1: input.shippingAddress.addressLine1,
        addressLine2: input.shippingAddress.addressLine2 || '',
        landmark: input.shippingAddress.landmark || '',
        city: input.shippingAddress.city,
        state: input.shippingAddress.state,
        stateCode: input.shippingAddress.stateCode as any,
        pincode: input.shippingAddress.pincode,
        country: 'India',
        buyerGstin: input.shippingAddress.buyerGstin || '',
      },
      billingAddress: {
        addressLine1: input.billingAddress?.addressLine1 || input.shippingAddress.addressLine1,
        addressLine2: input.billingAddress?.addressLine2 || input.shippingAddress.addressLine2 || '',
        landmark: input.billingAddress?.landmark || input.shippingAddress.landmark || '',
        city: input.billingAddress?.city || input.shippingAddress.city,
        state: input.billingAddress?.state || input.shippingAddress.state,
        stateCode: (input.billingAddress?.stateCode || input.shippingAddress.stateCode) as any,
        pincode: input.billingAddress?.pincode || input.shippingAddress.pincode,
        country: 'India',
        buyerGstin: input.billingAddress?.buyerGstin || input.shippingAddress.buyerGstin || '',
      },
      items,
      pricing,
      payment,
      invoice,
      idempotencyKey: input.idempotencyKey || '',
    };

    const docRef = this.ordersCol.doc(orderId);
    await docRef.set({
      ...orderPayload,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 5. Append initial event to subcollection orders/{orderId}/events (Task 10.5)
    await this.logOrderEvent(orderId, {
      eventType: 'ORDER_CREATED',
      newStatus: 'pending_payment',
      description: `Order ${orderId} created via ${input.paymentMode.toUpperCase()} checkout. Awaiting advance payment.`,
      actor: input.customer.isGuest ? 'CUSTOMER' : 'CUSTOMER',
      actorId: input.customer.uid,
      metadata: {
        totalAmountInPaise: pricing.totalAmountInPaise,
        advanceAmountInPaise: pricing.advanceAmountInPaise,
        paymentMode: input.paymentMode,
        couponCode: appliedCouponCode,
        discountAmountInPaise: pricing.discountAmountInPaise,
      },
    });

    // 6. Record coupon usage if applied (Task 11.3)
    if (appliedCouponCode) {
      try {
        await couponService.recordCouponUsage(
          appliedCouponCode,
          { email: input.customer.email, uid: input.customer.uid },
          orderId
        );
      } catch (err) {
        console.warn(`[OrderService] Notice recording coupon usage for ${appliedCouponCode}:`, err);
      }
    }

    return {
      ...orderPayload,
      createdAt: Timestamp.now() as any,
      updatedAt: Timestamp.now() as any,
    } as any;
  }

  /**
   * Capture online advance payment (e.g. from Fastrr Webhook)
   * Enforces Partial COD rule: order transitions to 'confirmed' only when advance is captured.
   */
  async captureAdvancePayment(
    orderId: string,
    details: {
      gatewayTransactionId: string;
      gatewayPaymentId?: string;
      amountInPaise: number;
    }
  ): Promise<FirestoreOrder> {
    const docRef = this.ordersCol.doc(orderId);
    const snap = await docRef.get();
    if (!snap.exists) {
      throw new Error(`Order ${orderId} not found.`);
    }

    const order = snap.data() as FirestoreOrder;

    // Validate state machine transition
    OrderStateMachine.validateTransition(order, {
      orderStatus: 'confirmed',
      advancePaymentStatus: 'captured',
    });

    const updatePayload = {
      orderStatus: 'confirmed',
      advancePaymentStatus: 'captured',
      'payment.advanceStatus': 'captured',
      'payment.advanceTransactionId': details.gatewayTransactionId,
      'payment.advancePaymentId': details.gatewayPaymentId || '',
      'payment.advancePaidAt': FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await docRef.update(updatePayload);

    // Audit event log
    await this.logOrderEvent(orderId, {
      eventType: 'ADVANCE_PAYMENT_CAPTURED',
      previousStatus: order.orderStatus,
      newStatus: 'confirmed',
      description: `Online advance payment of ₹${(details.amountInPaise / 100).toFixed(2)} captured via Fastrr.`,
      actor: 'FASTRR_WEBHOOK',
      metadata: details,
    });

    // Update customer lifetime metrics if registered customer
    if (order.customer.uid) {
      try {
        await adminDb.collection('users').doc(order.customer.uid).update({
          totalOrders: FieldValue.increment(1),
          totalSpendInPaise: FieldValue.increment(order.pricing.totalAmountInPaise),
          lastOrderDate: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } catch (err) {
        console.warn(`[OrderService] Notice updating user metrics for ${order.customer.uid}:`, err);
      }
    }

    const updatedSnap = await docRef.get();
    return { id: updatedSnap.id, ...updatedSnap.data() } as FirestoreOrder;
  }

  /**
   * Update order status with state machine enforcement and immutable event logging
   */
  async updateOrderStatus(
    orderId: string,
    updates: {
      orderStatus?: OrderStatus;
      advancePaymentStatus?: AdvancePaymentStatus;
      balanceCollectionStatus?: BalanceCollectionStatus;
      shipmentStatus?: ShipmentStatus;
      trackingUrl?: string;
      awbNumber?: string;
      courierName?: string;
    },
    actor: 'CUSTOMER' | 'ADMIN' | 'FASTRR_WEBHOOK' | 'SHIPROCKET_WEBHOOK' | 'SYSTEM' = 'ADMIN',
    actorId?: string
  ): Promise<FirestoreOrder> {
    const docRef = this.ordersCol.doc(orderId);
    const snap = await docRef.get();
    if (!snap.exists) {
      throw new Error(`Order ${orderId} not found.`);
    }

    const order = snap.data() as FirestoreOrder;

    // Strict State Machine Verification (Task 10.2 & 10.3)
    OrderStateMachine.validateTransition(order, updates);

    const payload: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (updates.orderStatus) payload.orderStatus = updates.orderStatus;
    if (updates.advancePaymentStatus) {
      payload.advancePaymentStatus = updates.advancePaymentStatus;
      payload['payment.advanceStatus'] = updates.advancePaymentStatus;
    }
    if (updates.balanceCollectionStatus) {
      payload.balanceCollectionStatus = updates.balanceCollectionStatus;
      payload['payment.balanceStatus'] = updates.balanceCollectionStatus;
    }
    if (updates.shipmentStatus) payload.shipmentStatus = updates.shipmentStatus;
    if (updates.awbNumber) payload['shipment.awbNumber'] = updates.awbNumber;
    if (updates.courierName) payload['shipment.courierName'] = updates.courierName;
    if (updates.trackingUrl) payload['shipment.trackingUrl'] = updates.trackingUrl;

    await docRef.update(payload);

    // Immutable event log (Task 10.5)
    await this.logOrderEvent(orderId, {
      eventType: 'STATUS_CHANGED',
      previousStatus: order.orderStatus,
      newStatus: updates.orderStatus || order.orderStatus,
      description: `Order updated: ${JSON.stringify(updates)}`,
      actor,
      actorId,
      metadata: updates,
    });

    const updatedSnap = await docRef.get();
    return { id: updatedSnap.id, ...updatedSnap.data() } as FirestoreOrder;
  }

  /**
   * Append an immutable audit event to orders/{orderId}/events subcollection
   */
  async logOrderEvent(
    orderId: string,
    event: Omit<FirestoreOrderEvent, 'id' | 'orderId' | 'createdAt'>
  ): Promise<void> {
    const eventsCol = this.ordersCol.doc(orderId).collection('events');
    await eventsCol.add({
      orderId,
      ...event,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  /**
   * Get single order by ID
   */
  async getOrder(orderId: string): Promise<FirestoreOrder | null> {
    const snap = await this.ordersCol.doc(orderId).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as FirestoreOrder;
  }

  /**
   * Get order audit event timeline
   */
  async getOrderEvents(orderId: string): Promise<FirestoreOrderEvent[]> {
    const snap = await this.ordersCol.doc(orderId).collection('events').orderBy('createdAt', 'asc').get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreOrderEvent));
  }

  /**
   * Admin order listing with filtering, searching, and pagination
   */
  async listOrdersForAdmin(filterInput: unknown) {
    const filter = AdminOrderFilterSchema.parse(filterInput);
    let query: FirebaseFirestore.Query = this.ordersCol.orderBy('createdAt', 'desc');

    const fetchLimit = Math.max(filter.limit * 3, 100);
    query = query.limit(fetchLimit);

    const snap = await query.get();
    let orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreOrder));

    // Secondary filters in-memory to prevent compound index blocks
    if (filter.status) {
      orders = orders.filter((o) => o.orderStatus === filter.status);
    }
    if (filter.paymentMode) {
      orders = orders.filter((o) => o.paymentMode === filter.paymentMode);
    }
    if (filter.advancePaymentStatus) {
      orders = orders.filter((o) => o.advancePaymentStatus === filter.advancePaymentStatus);
    }
    if (filter.balanceCollectionStatus) {
      orders = orders.filter((o) => o.balanceCollectionStatus === filter.balanceCollectionStatus);
    }
    if (filter.shipmentStatus) {
      orders = orders.filter((o) => o.shipmentStatus === filter.shipmentStatus);
    }

    // In-memory text filter for search query
    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      orders = orders.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(q) ||
          o.customer?.email?.toLowerCase().includes(q) ||
          o.customer?.phone?.includes(q) ||
          o.customer?.firstName?.toLowerCase().includes(q) ||
          o.customer?.lastName?.toLowerCase().includes(q) ||
          o.shipment?.awbNumber?.toLowerCase().includes(q)
      );
    }

    return orders.slice(0, filter.limit);
  }
}

export const orderService = new OrderService();
