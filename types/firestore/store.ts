import type { Timestamp } from './common';

export interface FirestoreCoupon {
  code: string; // Document ID: UPPERCASE coupon code (e.g. "WELCOME10")
  type: 'percentage' | 'flat';
  value: number; // e.g. 10 for 10% OR 50000 for ₹500.00 in paise
  minOrderValueInPaise: number; // e.g. 199900 (₹1,999.00)
  maxDiscountAmountInPaise?: number; // Cap for percentage discount (e.g. 50000 paise)
  maxTotalUses: number;
  maxUsesPerCustomer: number;
  currentUses: number;
  isActive: boolean;
  startDate: Timestamp;
  endDate: Timestamp;
  firstTimeCustomerOnly: boolean;
  applicableProductIds?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreReview {
  id: string; // Document ID: auto-generated
  productId: string; // "gutglow-daily-wellness"
  userId: string;
  customerEmail?: string;
  orderId: string; // Verified purchase order link
  customerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  comment: string;
  isVerifiedBuyer: boolean;
  status: 'pending' | 'approved' | 'rejected';
  moderatedBy?: string;
  moderatedAt?: Timestamp;
  moderatorNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ReturnReason =
  | 'damaged_in_transit'
  | 'broken_seal'
  | 'incorrect_item'
  | 'unopened_return';

export type ReturnStatus =
  | 'requested'
  | 'inspection_pending'
  | 'approved'
  | 'rejected'
  | 'completed';

export interface FirestoreReturn {
  id: string; // Document ID (e.g. "CLM-2611-XXXXXX")
  orderId: string; // "GG-2611-000001"
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: {
    baseSku: string;
    packOptionId: string;
    packName?: string;
    physicalUnitsCount?: number;
    physicalJarsCount?: number; // backward compatibility
    reason: ReturnReason;
  }[];
  damagedImageUrls: string[]; // Evidence uploaded to Firebase Storage
  customerNotes?: string;
  status: ReturnStatus;
  restockEligible: boolean; // false for consumable returns (strictly non-restockable)
  restocked: boolean;
  replacementOrderId?: string;
  adminNotes?: string;
  rejectionReason?: string;
  inspectedBy?: string;
  inspectedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreRefund {
  id: string; // Document ID
  orderId: string; // "GG-2611-000001"
  returnId?: string;
  amountInPaise: number; // Integer paise
  reason: 'customer_return' | 'cancellation' | 'stockout_auto_refund';
  method: 'original_payment_gateway' | 'bank_transfer';
  gatewayRefundId?: string;
  status: 'initiated' | 'processed' | 'failed';
  processedBy: string; // Admin UID or "SYSTEM"
  createdAt: Timestamp;
}

export interface FirestoreStoreConfig {
  storeName: 'GutGlow';
  contactEmail: string;
  supportPhone: string;
  sellerGstin: string; // Statutory GSTIN [REQUIRES_CA_CONFIRMATION]
  sellerStateCode: string; // "27" for Maharashtra
  currency: 'INR';

  // Configurable Business Policies
  minShelfLifeMonthsAtDispatch: number; // Default: 6 months
  returnWindowDays: number; // Default: 5 days from delivery
  allowReturnsOnUnopened: boolean;
  replacementOnlyOnTransitDamage: boolean;
  freeShippingThresholdInPaise: number; // e.g. 99900 (₹999.00)
  defaultShippingFeeInPaise: number; // e.g. 9900 (₹99.00)

  updatedAt: Timestamp;
  updatedBy: string;
}

export type AdminAuditAction =
  | 'UPDATE_PRODUCT_PRICE'
  | 'ADJUST_PHYSICAL_STOCK'
  | 'CREATE_BATCH'
  | 'CANCEL_ORDER'
  | 'APPROVE_RETURN'
  | 'PROCESS_REFUND'
  | 'RECONCILE_PARTIAL_COD_BALANCE'
  | 'UPDATE_STORE_SETTINGS';

export interface FirestoreAdminLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminRole: string;
  action: AdminAuditAction;
  resourceType: 'product' | 'inventory' | 'batch' | 'order' | 'return' | 'coupon' | 'settings';
  resourceId: string;
  beforeSnapshot?: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Timestamp;
}

export interface FirestoreProcessedWebhook {
  id: string; // "fastrr_evt_..." or "shiprocket_evt_..."
  provider: 'fastrr' | 'shiprocket';
  eventId: string;
  orderId?: string;
  processedAt: Timestamp;
  payloadHash: string;
}

export interface FirestoreCounter {
  name: string; // e.g. "orders_202611"
  sequence: number; // e.g. 10482
  updatedAt: Timestamp;
}

export interface FirestoreCounterShard {
  shardId: number; // 0 to 9
  sequence: number;
  updatedAt: Timestamp;
}

export type SupportQueryStatus = 'new' | 'in_progress' | 'resolved';

export interface FirestoreSupportQuery {
  id: string; // Document ID (e.g. "QRY-XXXXXX")
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: SupportQueryStatus;
  adminNotes?: string;
  resolvedAt?: Timestamp;
  resolvedBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
