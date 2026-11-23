import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { generateSequentialOrderId } from '@/lib/services/orderIdGenerator';
import { batchAllocationService } from '@/lib/services/batchAllocationService';
import { ProductRepository } from '@/lib/repositories/productRepository';
import type {
  FirestoreOrder,
  OrderItemSnapshot,
  OrderPricingSnapshot,
  OrderPaymentSnapshot,
  OrderInvoiceSnapshot,
} from '@/types/firestore/order';
import type { FirestoreReturn, ReturnReason, ReturnStatus } from '@/types/firestore/store';
import type {
  CheckClaimEligibilityInput,
  CreateClaimInput,
  AdminReviewClaimInput,
  AdminClaimFilterInput,
} from '@/lib/validations/claimSchema';

const CLAIM_WINDOW_HOURS = 48; // Standard 48-hour window from delivery for consumable health goods

export interface EligibilityResult {
  eligible: boolean;
  code?: 'ELIGIBLE' | 'ORDER_NOT_FOUND' | 'PHONE_MISMATCH' | 'NOT_DELIVERED' | 'WINDOW_EXPIRED' | 'ALREADY_EXISTS';
  message: string;
  order?: {
    id: string;
    customer: {
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
    };
    items: Array<{
      productId: string;
      productName: string;
      baseSku: string;
      packOptionId: string;
      packName: string;
      quantity: number;
      unitPriceInPaise: number;
    }>;
    deliveredAt?: string;
    hoursRemaining?: number;
  };
  existingClaim?: {
    id: string;
    status: ReturnStatus;
    reason: ReturnReason;
    replacementOrderId?: string;
    createdAt: string;
  };
}

export class ClaimService {
  private returnsCol = adminDb.collection('returns');
  private ordersCol = adminDb.collection('orders');
  private refundsCol = adminDb.collection('refunds');
  private adminLogsCol = adminDb.collection('adminLogs');
  private productRepo = new ProductRepository();

  /**
   * Check if an order is eligible for transit damage / broken seal replacement.
   * Enforces:
   * 1. Order exists
   * 2. Phone matches customer on file
   * 3. Order is in 'delivered' shipment status
   * 4. Delivered within the 48-hour consumable food safety window
   * 5. No active/existing claim on this order
   */
  async checkEligibility(input: CheckClaimEligibilityInput): Promise<EligibilityResult> {
    const orderDoc = await this.ordersCol.doc(input.orderId).get();
    if (!orderDoc.exists) {
      return {
        eligible: false,
        code: 'ORDER_NOT_FOUND',
        message: `Order "${input.orderId}" was not found. Please verify your order number.`,
      };
    }

    const order = orderDoc.data() as FirestoreOrder;

    // Normalize phone numbers (strip +91, 0, spaces)
    const normalizePhone = (p: string) => p.replace(/\D/g, '').slice(-10);
    const orderPhone = normalizePhone(order.customer?.phone || '');
    const inputPhone = normalizePhone(input.customerPhone);

    if (orderPhone !== inputPhone) {
      return {
        eligible: false,
        code: 'PHONE_MISMATCH',
        message: 'The mobile number entered does not match the contact number on this order.',
      };
    }

    // Must be in delivered state
    if (order.shipmentStatus !== 'delivered') {
      return {
        eligible: false,
        code: 'NOT_DELIVERED',
        message: `This order is currently "${(order.shipmentStatus || 'processing').replace(/_/g, ' ')}". Damage and transit claims can only be filed once the parcel has been physically delivered.`,
      };
    }

    // Calculate delivery time & window from store config (Task 13.1)
    let windowHours = CLAIM_WINDOW_HOURS;
    try {
      const storeConfigDoc = await adminDb.collection('settings').doc('store_config').get();
      if (storeConfigDoc.exists) {
        const config = storeConfigDoc.data();
        if (config?.claimWindowHours) {
          windowHours = Number(config.claimWindowHours);
        } else if (config?.damageClaimWindowHours) {
          windowHours = Number(config.damageClaimWindowHours);
        } else {
          // Consumable health products: strict 48-hour transit damage reporting window
          windowHours = 48;
        }
      }
    } catch (cfgErr) {
      console.warn('[ClaimService] Notice reading store_config:', cfgErr);
    }

    // Use deliveredAt timestamp if recorded, otherwise fallback to order.updatedAt
    const deliveryTimestamp: Timestamp = (order as any).deliveredAt || order.updatedAt || order.createdAt;
    const deliveredAtDate = deliveryTimestamp?.toDate ? deliveryTimestamp.toDate() : new Date();
    const elapsedMs = Date.now() - deliveredAtDate.getTime();
    const elapsedHours = elapsedMs / (1000 * 60 * 60);

    if (elapsedHours > windowHours) {
      return {
        eligible: false,
        code: 'WINDOW_EXPIRED',
        message: `The ${windowHours}-hour damage reporting window has elapsed (${Math.round(elapsedHours)} hours since delivery). Due to consumable wellness hygiene and FSSAI safety protocols, transit claims cannot be processed after ${windowHours} hours of delivery.`,
      };
    }

    // Check if an existing claim is already registered
    const existingClaimSnap = await this.returnsCol
      .where('orderId', '==', input.orderId)
      .limit(1)
      .get();

    if (!existingClaimSnap.empty) {
      const claimData = existingClaimSnap.docs[0].data() as FirestoreReturn;
      return {
        eligible: false,
        code: 'ALREADY_EXISTS',
        message: `A damage claim (${existingClaimSnap.docs[0].id}) has already been registered for this order.`,
        existingClaim: {
          id: existingClaimSnap.docs[0].id,
          status: claimData.status,
          reason: claimData.items?.[0]?.reason || 'damaged_in_transit',
          replacementOrderId: claimData.replacementOrderId,
          createdAt: claimData.createdAt?.toDate ? claimData.createdAt.toDate().toISOString() : new Date().toISOString(),
        },
      };
    }

    const hoursRemaining = Math.max(0, Math.round(CLAIM_WINDOW_HOURS - elapsedHours));

    return {
      eligible: true,
      code: 'ELIGIBLE',
      message: 'Order is eligible for transit replacement claim.',
      order: {
        id: order.id,
        customer: {
          firstName: order.customer.firstName,
          lastName: order.customer.lastName,
          phone: order.customer.phone,
          email: order.customer.email,
        },
        items: order.items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          baseSku: it.baseSku,
          packOptionId: it.packOptionId,
          packName: it.packName,
          quantity: it.quantity,
          unitPriceInPaise: (it as any).unitPriceInPaise || it.unitSellingPriceInPaise || 0,
        })),
        deliveredAt: deliveredAtDate.toISOString(),
        hoursRemaining,
      },
    };
  }

  /**
   * Submit a Transit Damage / Broken Seal Claim
   */
  async createClaim(input: CreateClaimInput, actorUid?: string): Promise<FirestoreReturn> {
    const eligibility = await this.checkEligibility({
      orderId: input.orderId,
      customerPhone: input.customerPhone,
    });

    if (!eligibility.eligible) {
      throw new Error(eligibility.message);
    }

    const orderDoc = await this.ordersCol.doc(input.orderId).get();
    const order = orderDoc.data() as FirestoreOrder;

    // Generate readable claim ID e.g. CLM-2611-AB12
    const claimId = `CLM-${input.orderId.replace('GG-', '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const claimPayload: FirestoreReturn = {
      id: claimId,
      orderId: input.orderId,
      customerId: order.customer.uid || actorUid || 'guest',
      customerName: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail || order.customer.email,
      items: input.items.map((it) => ({
        baseSku: it.baseSku,
        packOptionId: it.packOptionId,
        packName: it.packName || 'Standard Pack',
        physicalUnitsCount: it.physicalUnitsCount || 1,
        physicalJarsCount: it.physicalUnitsCount || 1, // legacy fallback
        reason: it.reason,
      })),
      damagedImageUrls: input.damagedImageUrls,
      customerNotes: input.customerNotes,
      status: 'requested',
      restockEligible: false, // Ingestible product: strictly non-restockable writeoff
      restocked: false,
      createdAt: FieldValue.serverTimestamp() as any,
      updatedAt: FieldValue.serverTimestamp() as any,
    };

    // Save claim document
    await this.returnsCol.doc(claimId).set(claimPayload);

    // Update order with active claim flag
    await this.ordersCol.doc(input.orderId).update({
      hasActiveClaim: true,
      activeClaimId: claimId,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Append audit event in orders/{orderId}/events
    await this.ordersCol.doc(input.orderId).collection('events').add({
      eventType: 'TRANSIT_CLAIM_FILED',
      newStatus: order.orderStatus,
      description: `Damage/Broken seal claim filed (${claimId}). Reason: ${input.reason.replace(/_/g, ' ')}. ${input.damagedImageUrls.length} photo(s) submitted for inspection.`,
      actor: 'CUSTOMER',
      actorId: actorUid || input.customerPhone,
      metadata: {
        claimId,
        reason: input.reason,
        damagedPhotosCount: input.damagedImageUrls.length,
      },
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      ...claimPayload,
      createdAt: Timestamp.now() as any,
      updatedAt: Timestamp.now() as any,
    };
  }

  /**
   * Review claim: Approve for Free Replacement, Reject, or Issue Special Refund
   */
  async reviewClaim(
    claimId: string,
    admin: { uid: string; email?: string },
    input: AdminReviewClaimInput
  ): Promise<{ success: boolean; claim: FirestoreReturn; replacementOrderId?: string }> {
    const claimDoc = await this.returnsCol.doc(claimId).get();
    if (!claimDoc.exists) {
      throw new Error(`Claim "${claimId}" not found.`);
    }

    const claim = claimDoc.data() as FirestoreReturn;
    const originalOrderDoc = await this.ordersCol.doc(claim.orderId).get();
    if (!originalOrderDoc.exists) {
      throw new Error(`Original Order "${claim.orderId}" not found.`);
    }
    const originalOrder = originalOrderDoc.data() as FirestoreOrder;

    if (input.action === 'approve_replacement') {
      // 1. Generate an automated 100% Free Replacement Order
      const replacementOrderId = await generateSequentialOrderId();

      // Allocate fresh batch inventory for replacement items
      const replacementItems: OrderItemSnapshot[] = [];
      let totalPhysicalUnits = 0;

      for (const item of claim.items) {
        const product = await this.productRepo.findById('gutglow-daily-wellness'); // Primary formulation
        const unitsNeeded = item.physicalUnitsCount || 1;
        totalPhysicalUnits += unitsNeeded;

        let batchResult = null;
        try {
          batchResult = await batchAllocationService.allocateBatchesForOrder(
            item.baseSku,
            unitsNeeded
          );
        } catch (allocErr) {
          console.warn(`[ClaimService] Warning on replacement batch allocation:`, allocErr);
        }

        replacementItems.push({
          productId: product?.id || 'gutglow-daily-wellness',
          productName: product?.name || 'GutGlow Daily Wellness Formula',
          baseSku: item.baseSku,
          packOptionId: item.packOptionId,
          packName: item.packName || 'Replacement Unit',
          packQuantity: unitsNeeded,
          totalPhysicalJars: unitsNeeded,
          unitSellingPriceInPaise: 0, // Free replacement
          mrpInPaise: 0,
          hsnCode: '2106 90 99',
          gstRateBasisPoints: 1800,
          quantity: 1,
          lineGrossTotalInPaise: 0,
          image: '/images/gutglow-product-front.jpg',
          assignedBatchNumbers: batchResult?.allocations?.map((b: any) => b.batchNumber) || [],
        });
      }

      const replacementPricing: OrderPricingSnapshot = {
        currency: 'INR',
        grossProductAmountInPaise: 0,
        discountAmountInPaise: 0,
        netProductPayableInPaise: 0,
        shippingFeeInPaise: 0,
        taxableValueInPaise: 0,
        cgstAmountInPaise: 0,
        sgstAmountInPaise: 0,
        igstAmountInPaise: 0,
        totalGstAmountInPaise: 0,
        totalAmountInPaise: 0,
        advanceAmountInPaise: 0,
        balanceAmountInPaise: 0,
      };

      const replacementPayment: OrderPaymentSnapshot = {
        mode: 'prepaid',
        advanceAmountInPaise: 0,
        balanceAmountInPaise: 0,
        advanceStatus: 'captured',
        advanceGateway: 'fastrr',
        balanceStatus: 'not_applicable',
      };

      const replacementInvoice: OrderInvoiceSnapshot = {
        invoiceNumber: `INV-${replacementOrderId}`,
        invoiceDate: Timestamp.now(),
        placeOfSupplyStateCode: originalOrder.shippingAddress.stateCode,
        sellerGstin: '27AABCU9603R1ZM',
      };

      const replacementOrderPayload = {
        id: replacementOrderId,
        orderStatus: 'confirmed', // Immediately confirmed and ready for warehouse dispatch
        paymentMode: 'prepaid',
        advancePaymentStatus: 'captured',
        balanceCollectionStatus: 'not_applicable',
        shipmentStatus: 'unfulfilled',
        customer: originalOrder.customer,
        shippingAddress: originalOrder.shippingAddress,
        billingAddress: originalOrder.billingAddress,
        items: replacementItems,
        pricing: replacementPricing,
        payment: replacementPayment,
        invoice: replacementInvoice,
        isReplacement: true,
        parentOrderId: originalOrder.id,
        claimId,
        idempotencyKey: `REPL-${claimId}`,
      };

      // Save replacement order
      await this.ordersCol.doc(replacementOrderId).set({
        ...replacementOrderPayload,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Log event in replacement order
      await this.ordersCol.doc(replacementOrderId).collection('events').add({
        eventType: 'REPLACEMENT_ORDER_CREATED',
        newStatus: 'confirmed',
        description: `100% Free Replacement Order created for Claim ${claimId} (Parent Order: ${originalOrder.id}). Ready for packaging.`,
        actor: 'ADMIN',
        actorId: admin.email || admin.uid,
        metadata: { parentOrderId: originalOrder.id, claimId },
        createdAt: FieldValue.serverTimestamp(),
      });

      // 2. Update claim document
      await this.returnsCol.doc(claimId).update({
        status: 'approved',
        replacementOrderId,
        adminNotes: input.adminNotes || '',
        inspectedBy: admin.email || admin.uid,
        inspectedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // 3. Log event in original order
      await this.ordersCol.doc(claim.orderId).collection('events').add({
        eventType: 'TRANSIT_CLAIM_APPROVED',
        newStatus: originalOrder.orderStatus,
        description: `Transit damage claim ${claimId} approved by admin. Free replacement order ${replacementOrderId} scheduled for dispatch.`,
        actor: 'ADMIN',
        actorId: admin.email || admin.uid,
        metadata: { claimId, replacementOrderId },
        createdAt: FieldValue.serverTimestamp(),
      });

      // 4. Log in admin audit logs
      await this.adminLogsCol.add({
        adminUid: admin.uid,
        adminEmail: admin.email || '',
        action: 'APPROVE_TRANSIT_CLAIM',
        targetType: 'RETURN_CLAIM',
        targetId: claimId,
        details: { orderId: claim.orderId, replacementOrderId, adminNotes: input.adminNotes },
        timestamp: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        claim: {
          ...claim,
          status: 'approved',
          replacementOrderId,
          adminNotes: input.adminNotes,
          inspectedBy: admin.email || admin.uid,
        },
        replacementOrderId,
      };
    } else if (input.action === 'reject') {
      await this.returnsCol.doc(claimId).update({
        status: 'rejected',
        rejectionReason: input.rejectionReason || 'Claim does not meet transit damage criteria',
        adminNotes: input.adminNotes || '',
        inspectedBy: admin.email || admin.uid,
        inspectedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Log in original order
      await this.ordersCol.doc(claim.orderId).collection('events').add({
        eventType: 'TRANSIT_CLAIM_REJECTED',
        newStatus: originalOrder.orderStatus,
        description: `Transit damage claim ${claimId} rejected by admin. Reason: ${input.rejectionReason || 'Not eligible'}.`,
        actor: 'ADMIN',
        actorId: admin.email || admin.uid,
        metadata: { claimId, rejectionReason: input.rejectionReason },
        createdAt: FieldValue.serverTimestamp(),
      });

      // Log in admin audit logs
      await this.adminLogsCol.add({
        adminUid: admin.uid,
        adminEmail: admin.email || '',
        action: 'REJECT_TRANSIT_CLAIM',
        targetType: 'RETURN_CLAIM',
        targetId: claimId,
        details: { orderId: claim.orderId, rejectionReason: input.rejectionReason },
        timestamp: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        claim: {
          ...claim,
          status: 'rejected',
          rejectionReason: input.rejectionReason,
          inspectedBy: admin.email || admin.uid,
        },
      };
    } else {
      // Rare override: Issue special refund (e.g. stockout / unable to fulfill replacement)
      const refundAmount = input.refundAmountInPaise || originalOrder.pricing.totalAmountInPaise;
      const refundId = `REF-${Date.now().toString().slice(-6)}`;

      await this.refundsCol.doc(refundId).set({
        id: refundId,
        orderId: claim.orderId,
        returnId: claimId,
        amountInPaise: refundAmount,
        reason: 'stockout_auto_refund',
        method: originalOrder.paymentMode === 'prepaid' ? 'original_payment_gateway' : 'bank_transfer',
        status: 'initiated',
        processedBy: admin.email || admin.uid,
        createdAt: FieldValue.serverTimestamp(),
      });

      await this.returnsCol.doc(claimId).update({
        status: 'completed',
        adminNotes: input.adminNotes || `Refund of ₹${(refundAmount / 100).toFixed(2)} initiated due to inventory constraint.`,
        inspectedBy: admin.email || admin.uid,
        inspectedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        claim: {
          ...claim,
          status: 'completed',
          adminNotes: input.adminNotes,
          inspectedBy: admin.email || admin.uid,
        },
      };
    }
  }

  /**
   * Admin fetch all claims with search, filters, pagination, and status breakdown counts
   */
  async getClaims(filter: AdminClaimFilterInput) {
    const snapshot = await this.returnsCol.orderBy('createdAt', 'desc').limit(200).get();

    let allClaims: FirestoreReturn[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
      } as FirestoreReturn;
    });

    const counts = {
      all: allClaims.length,
      requested: allClaims.filter((c) => c.status === 'requested' || c.status === 'inspection_pending').length,
      approved: allClaims.filter((c) => c.status === 'approved').length,
      rejected: allClaims.filter((c) => c.status === 'rejected').length,
      completed: allClaims.filter((c) => c.status === 'completed').length,
    };

    // Filter by status if not 'all'
    if (filter.status && filter.status !== 'all') {
      if (filter.status === 'requested') {
        allClaims = allClaims.filter(
          (c) => c.status === 'requested' || c.status === 'inspection_pending'
        );
      } else {
        allClaims = allClaims.filter((c) => c.status === filter.status);
      }
    }

    // Filter by search term
    if (filter.search && filter.search.trim()) {
      const query = filter.search.trim().toLowerCase();
      allClaims = allClaims.filter(
        (c) =>
          c.id.toLowerCase().includes(query) ||
          c.orderId.toLowerCase().includes(query) ||
          c.customerName?.toLowerCase().includes(query) ||
          c.customerPhone?.includes(query) ||
          c.customerEmail?.toLowerCase().includes(query)
      );
    }

    const paginated = allClaims.slice(filter.offset, filter.offset + filter.limit);

    return {
      claims: paginated,
      total: allClaims.length,
      counts,
    };
  }

  /**
   * Get single claim by ID with full original order context
   */
  async getClaimById(claimId: string) {
    const claimDoc = await this.returnsCol.doc(claimId).get();
    if (!claimDoc.exists) return null;

    const claim = { ...claimDoc.data(), id: claimDoc.id } as FirestoreReturn;
    const orderDoc = await this.ordersCol.doc(claim.orderId).get();
    const order = orderDoc.exists ? (orderDoc.data() as FirestoreOrder) : null;

    let replacementOrder: FirestoreOrder | null = null;
    if (claim.replacementOrderId) {
      const replDoc = await this.ordersCol.doc(claim.replacementOrderId).get();
      if (replDoc.exists) {
        replacementOrder = replDoc.data() as FirestoreOrder;
      }
    }

    return {
      claim,
      order,
      replacementOrder,
    };
  }
}

export const claimService = new ClaimService();
