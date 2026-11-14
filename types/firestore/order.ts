import type { Timestamp, IndianGstStateCode } from './common';

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'returned'
  | 'partially_returned';

// Confirmed Payment Modes
export type PaymentMode = 'prepaid' | 'partial_cod';

// Online Advance Payment Status
export type AdvancePaymentStatus =
  | 'unpaid'
  | 'captured'
  | 'failed'
  | 'refund_required'
  | 'refund_pending'
  | 'refunded'
  | 'refund_failed';

// Remaining Balance Collection Status (Decoupled Physical Delivery vs Cash Collection vs Remittance)
export type BalanceCollectionStatus =
  | 'not_applicable'                   // Full Prepaid orders (no balance on delivery)
  | 'pending_delivery'                 // Partial COD dispatched, awaiting courier delivery
  | 'awaiting_collection_confirmation' // Parcel physically delivered; cash collection unconfirmed
  | 'collected'                        // Courier cash collection verified (API event or admin verified)
  | 'remitted'                         // Courier remitted funds to merchant bank (CRN/UTR reconciled)
  | 'discrepancy';                     // Remittance deficit, deduction, or courier dispute

export type ShipmentStatus =
  | 'unfulfilled'
  | 'manifest_generated'
  | 'pickup_scheduled'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'ndr_pending'
  | 'rto_initiated'
  | 'rto_delivered';

export interface OrderCustomerSnapshot {
  uid?: string; // Authenticated User ID or undefined for guest
  email: string;
  phone: string; // 10-digit Indian mobile number
  firstName: string;
  lastName: string;
  isGuest: boolean;
}

export interface OrderAddressSnapshot {
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  stateCode: IndianGstStateCode; // e.g. "27" for Maharashtra
  pincode: string; // 6 digits
  country: 'India';
  buyerGstin?: string; // Optional B2B GSTIN
}

export interface OrderItemSnapshot {
  productId: string; // "gutglow-daily-wellness"
  productName: string; // "GutGlow Daily Wellness Formula"
  packOptionId: string; // "pack-3-month"
  packName: string; // "3-Month Optimal Ritual"
  baseSku: string; // "GG-DWF-200G"
  packQuantity: number; // e.g. 3 physical jars per pack
  quantity: number; // Order item quantity (e.g. 1)
  totalPhysicalJars: number; // packQuantity * quantity (e.g. 3)
  unitSellingPriceInPaise: number; // e.g. 489900 (₹4,899.00 GST-inclusive)
  mrpInPaise: number; // e.g. 749700 (₹7,497.00)
  lineGrossTotalInPaise: number; // unitSellingPriceInPaise * quantity
  hsnCode: string; // "2106 90 99" [REQUIRES_CA_CONFIRMATION]
  gstRateBasisPoints: number; // 1800 (18.00% GST) [REQUIRES_CA_CONFIRMATION]
  image: string;
  assignedBatchNumbers?: string[]; // Allocated physical batches via FEFO
}

export interface OrderPricingSnapshot {
  currency: 'INR';
  grossProductAmountInPaise: number; // Total before discount
  discountAmountInPaise: number; // Total discount
  couponCode?: string;
  netProductPayableInPaise: number; // grossProductAmount - discountAmount
  taxableValueInPaise: number; // Value before GST
  cgstAmountInPaise: number; // CGST (if intra-state MH->MH)
  sgstAmountInPaise: number; // SGST (if intra-state MH->MH)
  igstAmountInPaise: number; // IGST (if inter-state)
  totalGstAmountInPaise: number; // cgst + sgst OR igst
  shippingFeeInPaise: number; // 0 for free shipping
  totalAmountInPaise: number; // Final total order amount (Integer paise)
  advanceAmountInPaise: number; // Amount paid online (100% for prepaid, advance % for partial_cod)
  balanceAmountInPaise: number; // Remaining balance due on delivery (0 for prepaid)
}

export interface OrderPaymentSnapshot {
  mode: PaymentMode;
  advanceAmountInPaise: number;
  balanceAmountInPaise: number;
  advanceStatus: AdvancePaymentStatus;
  advanceGateway: 'fastrr';
  advanceTransactionId?: string; // Fastrr transaction ID
  advancePaymentId?: string;
  advancePaidAt?: Timestamp;
  advanceFailureReason?: string;

  // Partial COD Balance Tracking
  balanceStatus: BalanceCollectionStatus;
  balanceCollectionSource?: 'shiprocket_api_event' | 'manual_admin_reconciliation';
  balanceCollectedAt?: Timestamp;
  balanceRemittanceReference?: string; // Courier Remittance UTR or CRN
  balanceRemittedAt?: Timestamp;
  balanceRemittedAmountInPaise?: number;
  balanceDiscrepancyReason?: string;
}

export interface OrderInvoiceSnapshot {
  invoiceNumber: string; // "GG/26-27/00001" (Statutory gapless invoice)
  invoiceDate: Timestamp;
  sellerGstin: string; // e.g. "27AAAAA0000A1Z5"
  placeOfSupplyStateCode: IndianGstStateCode; // "27"
  invoicePdfUrl?: string; // Firebase Storage URL
}

export interface OrderShipmentSnapshot {
  shiprocketOrderId?: number;
  shipmentId?: number;
  awbNumber?: string; // Delhivery / Blue Dart AWB
  courierName?: string;
  trackingUrl?: string; // Shiprocket Branded Tracking URL (https://shiprocket.co/tracking/{awb})
  labelPdfUrl?: string;
  manifestUrl?: string;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;
}

export interface FirestoreOrder {
  id: string; // Document ID: "GG-YYMM-XXXXXX" (e.g. "GG-2611-000001")
  orderNumber: string; // "GG-2611-000001"

  // Independent Status Dimensions
  orderStatus: OrderStatus;
  paymentMode: PaymentMode;
  advancePaymentStatus: AdvancePaymentStatus;
  balanceCollectionStatus: BalanceCollectionStatus;
  shipmentStatus: ShipmentStatus;

  // Immutable Snapshots
  customer: OrderCustomerSnapshot;
  shippingAddress: OrderAddressSnapshot;
  billingAddress: OrderAddressSnapshot;
  items: OrderItemSnapshot[];
  pricing: OrderPricingSnapshot;
  payment: OrderPaymentSnapshot;
  invoice: OrderInvoiceSnapshot;
  shipment?: OrderShipmentSnapshot;

  // Security & Audit
  idempotencyKey?: string;
  clientIp?: string;
  userAgent?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestorePaymentAttempt {
  id: string; // Document ID: "att_fastrr_..."
  orderId: string; // "GG-2611-000001"
  gateway: 'fastrr';
  paymentMode: PaymentMode;
  attemptType: 'advance' | 'full_prepaid';
  amountInPaise: number;
  status: 'initiated' | 'failed' | 'success';
  gatewayTransactionId?: string;
  gatewayPaymentId?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: Timestamp;
}

export type OrderEventType =
  | 'ORDER_CREATED'
  | 'ADVANCE_PAYMENT_CAPTURED'
  | 'ADVANCE_PAYMENT_FAILED'
  | 'STATUS_CHANGED'
  | 'AWB_GENERATED'
  | 'PICKUP_SCHEDULED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'BALANCE_COLLECTED'
  | 'BALANCE_REMITTED'
  | 'NDR_RAISED'
  | 'RTO_INITIATED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'REFUND_PROCESSED';

export interface FirestoreOrderEvent {
  id: string; // Auto-generated ID
  orderId: string; // "GG-2611-000001"
  eventType: OrderEventType;
  previousStatus?: string;
  newStatus: string;
  description: string;
  actor: 'CUSTOMER' | 'ADMIN' | 'FASTRR_WEBHOOK' | 'SHIPROCKET_WEBHOOK' | 'SYSTEM';
  actorId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Timestamp;
}

export interface FirestoreCodRemittance {
  id: string; // Document ID: e.g. "rem_202611_001"
  crnNumber: string; // Credit Reference Number from Shiprocket
  bankUtr: string; // Bank Transaction UTR
  courierName: string; // e.g. "Blue Dart Express"
  totalOrdersCount: number;
  totalBalanceCollectedInPaise: number; // Sum of balance amounts expected
  totalRemittedAmountInPaise: number; // Actual amount transferred to GutGlow bank
  discrepancyAmountInPaise: number; // totalBalanceCollected - totalRemitted
  status: 'reconciled' | 'discrepancy' | 'pending_audit';
  matchedOrderNumbers: string[]; // ["GG-2611-000001", "GG-2611-000005"]
  remittedAt: Timestamp;
  reconciledBy: string; // Admin UID or "SYSTEM_CRON"
  notes?: string;
  createdAt: Timestamp;
}
