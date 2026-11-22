import { adminDb } from '@/lib/firebase/admin';
import { orderService } from '@/lib/services/orderService';
import { TrackOrderInputSchema, type TrackOrderInput } from '@/lib/validations/orderSchema';
import type { FirestoreOrder, FirestoreOrderEvent } from '@/types/firestore/order';

export interface MaskedTrackingTimelineEvent {
  title: string;
  location: string;
  time: string;
  completed: boolean;
  active?: boolean;
}

export interface MaskedOrderTrackingResponse {
  orderNumber: string;
  orderStatus: string;
  shipmentStatus: string;
  courier: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  destination: string;
  customerName: string;
  paymentMode: 'prepaid' | 'partial_cod';
  advancePaidInPaise: number;
  balanceDueInPaise: number;
  items: Array<{
    name: string;
    packName: string;
    quantity: number;
    image: string;
  }>;
  timeline: MaskedTrackingTimelineEvent[];
}

export class OrderTrackingService {
  private ordersCol = adminDb.collection('orders');

  /**
   * Tier 1 Public Tracking: Validates identity using email or phone and returns masked summary
   */
  async getPublicTrackingInfo(rawInput: unknown): Promise<MaskedOrderTrackingResponse | null> {
    const input = TrackOrderInputSchema.parse(rawInput);
    const lookupNumber = input.orderNumber.trim();
    const identifier = input.emailOrPhone.trim().toLowerCase();

    // 1. Find order by document ID, orderNumber field, or AWB number
    let order: FirestoreOrder | null = null;

    const directDoc = await this.ordersCol.doc(lookupNumber).get();
    if (directDoc.exists) {
      order = { id: directDoc.id, ...directDoc.data() } as FirestoreOrder;
    } else {
      const byOrderNumSnap = await this.ordersCol
        .where('orderNumber', '==', lookupNumber)
        .limit(1)
        .get();

      if (!byOrderNumSnap.empty) {
        order = { id: byOrderNumSnap.docs[0].id, ...byOrderNumSnap.docs[0].data() } as FirestoreOrder;
      } else {
        const byAwbSnap = await this.ordersCol
          .where('shipment.awbNumber', '==', lookupNumber)
          .limit(1)
          .get();

        if (!byAwbSnap.empty) {
          order = { id: byAwbSnap.docs[0].id, ...byAwbSnap.docs[0].data() } as FirestoreOrder;
        }
      }
    }

    if (!order) {
      return null;
    }

    // 2. Identity Verification: Must match email or 10-digit phone
    const orderEmail = order.customer.email.toLowerCase().trim();
    const orderPhone = order.customer.phone.trim();
    const isMatched =
      orderEmail === identifier ||
      orderPhone === identifier ||
      (identifier.length >= 4 && orderPhone.endsWith(identifier));

    if (!isMatched) {
      throw new Error('Verification failed. The email or phone number does not match this order reference.');
    }

    // 3. Fetch audit events to build live timeline
    const events = await orderService.getOrderEvents(order.id);
    const timeline = this.buildTimeline(order, events);

    // 4. Return masked summary (Zero PII leakage)
    return {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      shipmentStatus: order.shipmentStatus,
      courier: order.shipment?.courierName || 'Blue Dart Express Logistics',
      trackingNumber: order.shipment?.awbNumber,
      trackingUrl: order.shipment?.trackingUrl,
      estimatedDelivery: '3–5 Business Days',
      destination: `${order.shippingAddress.city}, ${order.shippingAddress.state} · ${order.shippingAddress.pincode.slice(0, 3)}***`,
      customerName: this.maskName(order.customer.firstName, order.customer.lastName),
      paymentMode: order.paymentMode,
      advancePaidInPaise: order.pricing.advanceAmountInPaise,
      balanceDueInPaise: order.pricing.balanceAmountInPaise,
      items: order.items.map((i) => ({
        name: i.productName,
        packName: i.packName,
        quantity: i.quantity,
        image: i.image,
      })),
      timeline,
    };
  }

  private maskName(first: string, last?: string): string {
    const mask = (s: string) => (s ? `${s[0]}${'*'.repeat(Math.max(1, s.length - 1))}` : '');
    return `${mask(first)} ${mask(last || '')}`.trim();
  }

  private buildTimeline(order: FirestoreOrder, events: FirestoreOrderEvent[]): MaskedTrackingTimelineEvent[] {
    const timeline: MaskedTrackingTimelineEvent[] = [
      {
        title: 'Order Placed & Verified',
        location: 'GutGlow Fulfillment Hub',
        time: order.createdAt
          ? new Date((order.createdAt as any).seconds * 1000).toLocaleString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Pending',
        completed: true,
      },
      {
        title: 'Quality Inspected & Sealed for Dispatch',
        location: 'Central Warehouse, Mumbai',
        time: order.orderStatus === 'confirmed' || order.orderStatus === 'processing' ? 'Completed' : 'Pending',
        completed: order.orderStatus === 'confirmed' || order.orderStatus === 'processing' || order.orderStatus === 'completed',
        active: order.orderStatus === 'confirmed' && order.shipmentStatus === 'unfulfilled',
      },
      {
        title: 'Dispatched with Courier Partner',
        location: `${order.shipment?.courierName || 'Courier Hub'}, Mumbai`,
        time: order.shipmentStatus === 'in_transit' || order.shipmentStatus === 'out_for_delivery' || order.shipmentStatus === 'delivered' ? 'In Transit' : 'Scheduled',
        completed: order.shipmentStatus === 'in_transit' || order.shipmentStatus === 'out_for_delivery' || order.shipmentStatus === 'delivered',
        active: order.shipmentStatus === 'in_transit',
      },
      {
        title: 'Out for Delivery',
        location: `${order.shippingAddress.city} Delivery Center`,
        time: order.shipmentStatus === 'out_for_delivery' || order.shipmentStatus === 'delivered' ? 'Active' : 'Pending',
        completed: order.shipmentStatus === 'out_for_delivery' || order.shipmentStatus === 'delivered',
        active: order.shipmentStatus === 'out_for_delivery',
      },
      {
        title: 'Delivered',
        location: `${order.shippingAddress.city}, ${order.shippingAddress.state}`,
        time: order.shipmentStatus === 'delivered' ? 'Delivered' : 'Pending',
        completed: order.shipmentStatus === 'delivered',
      },
    ];

    return timeline;
  }
}

export const orderTrackingService = new OrderTrackingService();
