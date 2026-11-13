# GUTGLOW — CLOUD FIRESTORE SCHEMA & DATABASE ARCHITECTURE PLAN

**Document Version:** 2.3.0 (Final Pre-Build Architecture Audit & Technical Corrections)  
**Target Database:** Google Cloud Firestore (Native Mode)  
**Proposed Region:** `asia-south1` (Mumbai, India) — *Subject to explicit user approval gate*  
**Scope:** Complete Data Architecture, Physical Stock & Batch Subcollections, Integer Paise Standard, Confirmed Payment Modes (Full Prepaid & Partial COD), CGST Invoicing, Composite Indexing, and Query Performance  

---

## 1. ARCHITECTURAL PHILOSOPHY & REVISION CHANGE LOG

### 1.1 Revision Change Log

#### v2.3.0 (Final Pre-Build Technical Audit Corrections)
- **Phased Firebase Setup**: Synchronized schema plans with phased deployment. Dev project `gutglow-development` and Local Emulator Suite prioritized; production database provisioning deferred to Phase 18.
- **Permanent Region Approval Gate**: Reaffirmed that Firestore location cannot be changed after creation. Cloud database creation remains blocked until user written sign-off on `asia-south1` (Mumbai).
- **Sequential vs Sharded Counter Models**: Formally defined single-doc counter schema for strict sequential numbers (`GG-2611-000001`) versus sharded counter subcollections (`counters/{name}/shards/{shardId}`) for high-concurrency uniqueness.
- **Inventory Reservation Lifecycle Schema**: Expanded `inventoryReservations` schema with `status` (`"active" | "committed" | "expired" | "released"`), `sessionToken`, and `orderNumber` to support 15-minute TTL hold and delayed webhook stock recovery.
- **Courier Remittance Schema (`codRemittances`)**: Added top-level schema for Shiprocket COD Remittance Advice (CRN, UTR, total collected vs remitted, and discrepancy tracking).
- **Unfinalized Policies Notice**: Clarified that customer advance forfeiture and deduction rules are intentionally unfinalized; refund fields remain neutral and extensible.

#### v2.2.0 (Confirmed Partial COD & Prepaid Payment Architecture)
- **Confirmed Payment Modes**: Eliminated generic/full COD. Schemas now exclusively support **`prepaid`** (100% online) and **`partial_cod`** (online advance + remaining balance on delivery).
- **Decoupled Quad-Status Model**: Partitioned order financial state into:
  - `advancePaymentStatus`: Tracks the online advance payment collected at checkout.
  - `balanceCollectionStatus`: Tracks the remaining balance collected by the courier on delivery and remitted to the merchant.
- **Financial Paise Breakdown**: Explicit fields added for `totalAmountInPaise`, `advanceAmountInPaise`, and `balanceAmountInPaise`.
- **Fastrr Configuration Separation**: The advance percentage is configured in Fastrr Checkout merchant settings and returned to GutGlow via webhook; it is not hardcoded in the schema.
- **Refund Policy Notice**: Formally documented that refund and cancellation policies (advance forfeiture, deduction percentages) are intentionally not finalized yet and remain extensible.

### 1.2 Core Architectural Principles
1. **Denormalization for Fast E-Commerce Reads**:
   - Storefront queries execute with `O(1)` document reads without relational joins.
   - All historical purchase data (product title, base SKU, pack multiplier, unit price in paise, customer shipping address, and tax breakdown) is immutably snapshot inside order line items to preserve legal tax invoice integrity.
2. **Physical Stock Truth**:
   - Inventory is stored only for actual physical units in the warehouse. Commercial multi-packs (e.g. 3-Month Pack) decrement physical jars using multipliers (`packQuantity * itemQty`).
3. **Deterministic Document ID Strategy**:
   - `products`: URL-friendly alphanumeric slug (e.g. `gutglow-daily-wellness`).
   - `categories`: URL-friendly slug (e.g. `gut-wellness-nutraceuticals`).
   - `inventory`: Physical SKU (e.g. `GG-DWF-200G`).
   - `orders`: Transactionally generated sequential ID (e.g. `GG-2611-000001`).
   - `users`: Exact Firebase Authentication `UserRecord.uid`.
   - `processedWebhooks`: Event ID from webhook provider (e.g. `fastrr_evt_98421048`).
4. **Standardized Temporal Fields**:
   - Every document maintains `createdAt: Timestamp` and `updatedAt: Timestamp`.
   - Soft deletions use `isArchived: boolean` and `archivedAt: Timestamp | null`.

---

## 2. TOP-LEVEL COLLECTIONS DIRECTORY

| Collection Path | Purpose | Primary Read Source | Primary Write Source |
| :--- | :--- | :--- | :--- |
| `products` | Master product catalog, specs, and pack options | Storefront (`/`, `/product`) & Admin | Admin (`/admin/products`) |
| `categories` | Taxonomies and display ordering | Storefront & Admin | Admin (`/admin/categories`) |
| `inventory` | Physical stock levels per base physical SKU | Storefront check / Cart / Admin | Transactional Order Engine / Admin |
| `inventoryTransactions`| Immutable audit ledger of physical stock movements | Admin Audit | Internal Services / Admin |
| `orders` | Commercial transactions and order records | Customer `/account` & Admin | Fastrr Webhook / Order API |
| `shipments` | Logistics manifests and AWB tracking records | Customer `/track-order` & Admin | Shiprocket Webhooks & Admin |
| `payments` | Gateway transaction audit logs | Admin Finance | Fastrr Payment Webhook |
| `returns` | Return & replacement requests with damage photos | Customer & Admin | Customer API / Admin Console |
| `refunds` | Refund records and financial ledgers (extensible) | Customer & Admin | Payment Gateway / Admin |
| `users` | Customer profiles and lifetime metrics | Customer `/account` & Admin | Auth Trigger / Customer API |
| `admins` | Administrative users and RBAC assignments | Admin Guard Middleware | Super Admin Bootstrap Script |
| `carts` | Server-synced active shopping carts | Storefront Cart Drawer | Cart Sync API (`/api/v1/cart`) |
| `coupons` | Promotional codes and usage limits | Storefront Cart & Admin | Admin (`/admin/coupons`) |
| `reviews` | Customer ratings and reviews | Storefront `/product` & Admin | Customer API / Admin Moderation |
| `notifications` | Transactional email & SMS dispatch log | Admin Diagnostic | Internal Event Dispatcher |
| `adminLogs` | Immutable administrative audit trail | Super Admin Audit | Admin API Mutation Middleware |
| `processedWebhooks`| Idempotency registry for external webhooks | Internal Webhook Handlers | Webhook Ingestion Routes |
| `counters` | Atomic sequential counters for Orders and Invoices | Internal Order / Invoice Services | Transactional Counter Engine |
| `inventoryReservations` | 15-minute temporary physical stock holds during checkout | Cart & Checkout Services | Fastrr Checkout Initiate API |
| `codRemittances` | Courier cash remittance manifests (CRN/UTR reconciliation) | Admin Finance (`/admin/cod-reconciliation`) | Remittance Reconciliation Service |
| `settings` | Store, tax, shipping, and return configurations | Storefront & Admin | Super Admin Settings Console |

---

## 3. COMPREHENSIVE DOCUMENT SCHEMAS

### 3.1 Collection: `products`
- **Document ID**: `[slug]` (e.g. `gutglow-daily-wellness`)

```typescript
export interface FirestoreProduct {
  id: string; // "gutglow-daily-wellness"
  slug: string; // "gutglow-daily-wellness"
  name: string; // "GutGlow Daily Wellness Formula"
  tagline: string; // "Thoughtful gut wellness for everyday living."
  shortDescription: string;
  fullDescription: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  status: "draft" | "active" | "archived";
  isFeatured: boolean;
  servingSize: string; // "1 Scoop (~6.5g) daily with water"
  baseSku: string; // "GG-DWF-200G" (Links to physical inventory)
  netWeightGrams: number; // 200
  hsnCode: string; // "2106 90 99" [REQUIRES_CA_CONFIRMATION]
  gstRateBasisPoints: number; // 1800 (18.00% GST) [REQUIRES_CA_CONFIRMATION]
  
  // Pack & Commercial Option Matrix (All prices in integer paise)
  packOptions: {
    id: string; // "pack-1-month"
    name: string; // "1-Month Supply"
    subtitle: string; // "30 Daily Servings"
    packQuantity: number; // 1 (Physical jar multiplier)
    servings: number; // 30
    durationMonths: number; // 1
    totalWeightGrams: number; // 200
    sellingPriceInPaise: number; // 199900 (₹1,999.00 GST-inclusive)
    mrpInPaise: number; // 249900 (₹2,499.00)
    compareAtPriceInPaise: number; // 249900
    badge?: string; // "Standard"
    isPopular: boolean;
    isActive: boolean;
  }[];

  // Media Gallery (Firebase Storage URLs)
  images: {
    id: string;
    src: string;
    alt: string;
    label: string;
    isPrimary: boolean;
    displayOrder: number;
  }[];

  // Nutritional & Formulation Metadata
  highlights: string[];
  features: {
    title: string;
    description: string;
  }[];
  specifications: {
    label: string;
    value: string;
  }[];
  ingredientsNote: string;
  provisionalIngredients: {
    category: string;
    items: string[];
    purpose: string;
  }[];
  directions: {
    step: string;
    instruction: string;
  }[];
  safetyInformation: string[];
  storageInstructions: string;

  // Cached Aggregates
  averageRating: number; // 4.9
  reviewCount: number; // 142
  totalPhysicalJarsSold: number; // 1840

  // SEO
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.2 Collection: `categories`
- **Document ID**: `[category-slug]` (e.g. `gut-wellness-nutraceuticals`)

```typescript
export interface FirestoreCategory {
  id: string; // "gut-wellness-nutraceuticals"
  name: string; // "Gut Wellness Nutraceuticals"
  slug: string; // "gut-wellness-nutraceuticals"
  description: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  productCount: number; // Cached counter
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.3 Collection: `inventory`
- **Document ID**: `[baseSku]` (e.g. `GG-DWF-200G` — Physical Item)

```typescript
export interface FirestoreInventory {
  sku: string; // "GG-DWF-200G"
  name: string; // "GutGlow Daily Wellness Formula (200g Jar)"
  productId: string; // "gutglow-daily-wellness"
  netWeightGrams: number; // 200
  
  // Authoritative Stock Naming Standard
  quantityAvailable: number; // Physical jars available for immediate sale
  quantityReserved: number; // Physical jars held in active 15-min checkouts
  quantityTotal: number; // quantityAvailable + quantityReserved
  lowStockThreshold: number; // e.g. 100 jars
  isLowStock: boolean;
  
  // Controls
  trackInventory: boolean;
  allowBackorders: boolean;
  batchTracking: boolean; // true
  activeBatchCount: number;
  
  updatedAt: Timestamp;
}
```

---

### 3.4 Subcollection: `inventory/{sku}/batches`
- **Document ID**: `[batchNumber]` (e.g. `BATCH-GG-2026-01`)

```typescript
export interface FirestoreBatch {
  batchNumber: string; // "BATCH-GG-2026-01"
  sku: string; // "GG-DWF-200G"
  manufacturingDate: Timestamp;
  expiryDate: Timestamp;
  mrpInPaise: number; // 249900 (₹2,499.00 printed on jar)
  
  // Authoritative Stock Quantities
  quantityInitial: number; // Received physical units (e.g. 2500)
  quantityAvailable: number; // Sellable units remaining in this batch (e.g. 1850)
  quantitySold: number; // Units fulfilled in orders (e.g. 650)
  quantityQuarantined: number; // Units held for quality check (e.g. 0)
  quantityDamaged: number; // Units written off to loss (e.g. 0)
  
  status: "active" | "quarantined" | "expired" | "depleted";
  labReportPdfUrl?: string; // FSSAI test report in Firebase Storage
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.5 Collection: `inventoryTransactions`
- **Document ID**: Auto-generated Push ID

```typescript
export interface FirestoreInventoryTransaction {
  id: string;
  sku: string; // "GG-DWF-200G"
  batchNumber?: string;
  type: 
    | "reservation" 
    | "purchase" 
    | "cancellation" 
    | "restock" 
    | "manual_adjustment" 
    | "loss_damaged";
  delta: number; // Negative for sale (-3), positive for restock (+500)
  previousStock: number;
  newStock: number;
  referenceType: "order" | "return" | "admin_adjustment" | "restock_po";
  referenceId: string; // e.g. "GG-2611-000001"
  notes?: string;
  operatorId: string; // Admin UID or "SYSTEM"
  createdAt: Timestamp;
}
```

---

### 3.6 Collection: `orders`
- **Document ID**: Sequential Format `GG-YYMM-XXXXXX` (e.g. `GG-2611-000001`)

```typescript
export type OrderStatus = 
  | "pending_payment" 
  | "confirmed" 
  | "processing" 
  | "completed" 
  | "cancelled" 
  | "returned" 
  | "partially_returned";

// Confirmed Payment Modes
export type PaymentMode = "prepaid" | "partial_cod";

// Online Advance Payment Status
export type AdvancePaymentStatus = 
  | "unpaid" 
  | "captured" 
  | "failed" 
  | "refund_required" 
  | "refund_pending" 
  | "refunded" 
  | "refund_failed";

// Remaining Balance Collection Status
export type BalanceCollectionStatus = 
  | "not_applicable"   // Full Prepaid orders
  | "pending_delivery" // Partial COD waiting for courier delivery
  | "collected"        // Courier collected balance from customer
  | "remitted"         // Courier remitted funds to merchant bank
  | "discrepancy";     // Remittance deficit or courier dispute

export type ShipmentStatus = 
  | "unfulfilled" 
  | "manifest_generated" 
  | "pickup_scheduled" 
  | "in_transit" 
  | "out_for_delivery" 
  | "delivered" 
  | "ndr_pending" 
  | "rto_initiated" 
  | "rto_delivered";

export interface FirestoreOrder {
  id: string; // "GG-2611-000001"
  orderNumber: string; // "GG-2611-000001"
  
  // Independent Quad-Status Model
  orderStatus: OrderStatus;
  paymentMode: PaymentMode;
  advancePaymentStatus: AdvancePaymentStatus;
  balanceCollectionStatus: BalanceCollectionStatus;
  shipmentStatus: ShipmentStatus;

  // Customer & Identity Snapshot
  customer: {
    uid?: string; // Authenticated User ID or null for guest
    email: string;
    phone: string; // "9876543210"
    firstName: string;
    lastName: string;
    isGuest: boolean;
  };

  // Shipping Destination Snapshot
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    stateCode: string; // "27" (Maharashtra GST Code)
    pincode: string; // "400050"
    country: "India";
  };

  // Billing Address Snapshot
  billingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    stateCode: string;
    pincode: string;
    country: "India";
    buyerGstin?: string; // Optional B2B GSTIN
  };

  // Line Item Snapshot (Physical Item & Multiplier Transparency)
  items: {
    productId: string; // "gutglow-daily-wellness"
    productName: string; // "GutGlow Daily Wellness Formula"
    packOptionId: string; // "pack-3-month"
    packName: string; // "3-Month Optimal Ritual"
    baseSku: string; // "GG-DWF-200G"
    packQuantity: number; // 3 (physical jars per pack)
    quantity: number; // 1 (order item quantity)
    totalPhysicalJars: number; // 3 * 1 = 3 physical jars
    unitSellingPriceInPaise: number; // 489900 (₹4,899.00 GST-inclusive)
    mrpInPaise: number; // 749700 (₹7,497.00)
    lineGrossTotalInPaise: number; // 489900
    hsnCode: string; // "2106 90 99" [REQUIRES_CA_CONFIRMATION]
    gstRateBasisPoints: number; // 1800 (18%) [REQUIRES_CA_CONFIRMATION]
    image: string;
    assignedBatchNumbers?: string[]; // Allocated batches via FEFO
  }[];

  // Financial Breakdown (All in Integer Paise)
  pricing: {
    currency: "INR";
    grossProductAmountInPaise: number; // 489900
    discountAmountInPaise: number; // 48900
    couponCode?: string;
    netProductPayableInPaise: number; // 441000
    taxableValueInPaise: number; // 373729 (extracted before GST)
    cgstAmountInPaise: number; // 33635 (if intra-state MH->MH)
    sgstAmountInPaise: number; // 33636
    igstAmountInPaise: number; // 0 (or 67271 if inter-state)
    totalGstAmountInPaise: number; // 67271
    shippingFeeInPaise: number; // 0
    totalAmountInPaise: number; // 441000 (Final total order amount)
    advanceAmountInPaise: number; // Amount paid online (100% for prepaid, advance % for partial_cod)
    balanceAmountInPaise: number; // Remaining balance due on delivery (0 for prepaid)
  };

  // Authoritative Payment Details
  payment: {
    mode: PaymentMode;
    advanceAmountInPaise: number;
    balanceAmountInPaise: number;
    advanceStatus: AdvancePaymentStatus;
    advanceGateway: "fastrr";
    advanceTransactionId?: string; // Fastrr payment transaction ID
    advancePaymentId?: string;
    advancePaidAt?: Timestamp;
    advanceFailureReason?: string;
    // Partial COD Balance Tracking Fields
    balanceStatus: BalanceCollectionStatus;
    balanceCollectedAt?: Timestamp;
    balanceRemittanceReference?: string; // Courier Remittance UTR or CRN
    balanceRemittedAt?: Timestamp;
    balanceRemittedAmountInPaise?: number;
    balanceDiscrepancyReason?: string;
  };

  // Legal Tax Invoice Metadata (CGST Rule 46 Compliant)
  invoice: {
    invoiceNumber: string; // "GG/26-27/00001"
    invoiceDate: Timestamp;
    sellerGstin: string; // "27AAAAA0000A1Z5"
    placeOfSupplyStateCode: string; // "27"
    invoicePdfUrl?: string; // Firebase Storage link
  };

  // Logistics & Shipment Reference
  shipment?: {
    shiprocketOrderId?: number;
    shipmentId?: number;
    awbNumber?: string;
    courierName?: string;
    labelPdfUrl?: string;
    manifestUrl?: string;
    shippedAt?: Timestamp;
    deliveredAt?: Timestamp;
  };

  // Security & Audit
  idempotencyKey?: string;
  clientIp?: string;
  userAgent?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.7 Subcollection: `orders/{orderId}/paymentAttempts`
- **Document ID**: `[attemptId]`

```typescript
export interface FirestorePaymentAttempt {
  id: string; // "att_fastrr_984210"
  orderId: string; // "GG-2611-000001"
  gateway: "fastrr";
  paymentMode: PaymentMode;
  attemptType: "advance" | "full_prepaid";
  amountInPaise: number;
  status: "initiated" | "failed" | "success";
  gatewayTransactionId?: string;
  gatewayPaymentId?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: Timestamp;
}
```

---

### 3.8 Subcollection: `orders/{orderId}/events`
- **Document ID**: Auto-generated Push ID

```typescript
export interface FirestoreOrderEvent {
  id: string;
  orderId: string; // "GG-2611-000001"
  eventType: 
    | "ORDER_CREATED" 
    | "ADVANCE_PAYMENT_CAPTURED" 
    | "ADVANCE_PAYMENT_FAILED" 
    | "STATUS_CHANGED" 
    | "AWB_GENERATED" 
    | "PICKUP_SCHEDULED" 
    | "IN_TRANSIT" 
    | "OUT_FOR_DELIVERY" 
    | "DELIVERED" 
    | "BALANCE_COLLECTED" 
    | "BALANCE_REMITTED" 
    | "NDR_RAISED" 
    | "RTO_INITIATED" 
    | "CANCELLED" 
    | "RETURN_REQUESTED" 
    | "REFUND_PROCESSED";
  previousStatus?: string;
  newStatus: string;
  description: string;
  actor: "CUSTOMER" | "ADMIN" | "FASTRR_WEBHOOK" | "SHIPROCKET_WEBHOOK" | "SYSTEM";
  actorId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Timestamp;
}
```

---

### 3.9 Collection: `users` & Subcollection `addresses`

```typescript
export interface FirestoreUser {
  uid: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  totalOrders: number;
  totalSpendInPaise: number;
  lastOrderDate?: Timestamp;
  isEmailVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreAddress {
  id: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  stateCode: string; // Indian GST State Code (e.g. "27")
  pincode: string; // 6 digits
  country: "India";
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.10 Collection: `admins`

```typescript
export interface FirestoreAdmin {
  uid: string;
  email: string;
  name: string;
  role: "super_admin" | "order_manager" | "product_manager" | "support_manager";
  isActive: boolean;
  lastLoginAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3.11 Collection: `coupons`
- **Document ID**: `[COUPON_CODE]` in UPPERCASE (e.g. `WELCOME10`)

```typescript
export interface FirestoreCoupon {
  code: string; // "WELCOME10"
  type: "percentage" | "flat";
  value: number; // 10 for 10% OR 50000 for ₹500.00 in paise
  minOrderValueInPaise: number; // 199900 (₹1,999.00)
  maxDiscountAmountInPaise?: number; // 50000 (₹500.00 cap for percentage)
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
```

---

### 3.12 Collection: `reviews`

```typescript
export interface FirestoreReview {
  id: string;
  productId: string; // "gutglow-daily-wellness"
  userId: string;
  orderId: string; // Verified purchase link
  customerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  comment: string;
  isVerifiedBuyer: boolean;
  status: "pending" | "approved" | "rejected";
  moderatedBy?: string;
  moderatedAt?: Timestamp;
  createdAt: Timestamp;
}
```

---

### 3.13 Collection: `returns` & `refunds`

```typescript
export interface FirestoreReturn {
  id: string;
  orderId: string; // "GG-2611-000001"
  customerId: string;
  items: {
    baseSku: string;
    packOptionId: string;
    physicalJarsCount: number;
    reason: "damaged_in_transit" | "broken_seal" | "incorrect_item" | "unopened_return";
  }[];
  damagedImageUrls: string[]; // Firebase Storage evidence
  customerNotes?: string;
  status: "requested" | "inspection_pending" | "approved" | "rejected" | "completed";
  restockEligible: boolean; // true only if unopened, sealed RTO package
  restocked: boolean;
  replacementOrderId?: string;
  inspectedBy?: string;
  inspectedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Extensible Refund Record (Specific forfeiture / refund policy not finalized)
export interface FirestoreRefund {
  id: string;
  orderId: string;
  returnId?: string;
  amountInPaise: number; // Integer paise
  reason: "customer_return" | "cancellation" | "stockout_auto_refund";
  method: "original_payment_gateway" | "bank_transfer";
  gatewayRefundId?: string;
  status: "initiated" | "processed" | "failed";
  processedBy: string; // Admin UID or "SYSTEM"
  createdAt: Timestamp;
}
```

---

### 3.14 Collections: `processedWebhooks`, `counters`, `inventoryReservations` & `codRemittances`

```typescript
export interface FirestoreProcessedWebhook {
  id: string; // "fastrr_evt_98421048" or "shiprocket_evt_10482"
  provider: "fastrr" | "shiprocket";
  eventId: string;
  orderId?: string;
  processedAt: Timestamp;
  payloadHash: string;
}

// 1. Single-Document Counter (Strict Monotonic Sequence: GG-2611-000001)
export interface FirestoreCounter {
  name: string; // "orders_202611"
  sequence: number; // e.g. 10482
  updatedAt: Timestamp;
}

// 2. Distributed Sharded Counter (Flash Sale High Concurrency: GG-2611-S3-000142)
// Path: counters/{name}/shards/{shardId} (0 to 9)
// Note: Sharding guarantees mathematical uniqueness, NOT globally monotonic sequentiality.
export interface FirestoreCounterShard {
  shardId: number; // 0 to 9
  sequence: number;
  updatedAt: Timestamp;
}

export interface FirestoreInventoryReservation {
  id: string; // "res_01HZX..."
  orderNumber: string; // "GG-2611-000001"
  sku: string; // "GG-DWF-200G"
  requestedPhysicalJars: number;
  sessionToken: string; // Associated Fastrr checkout session ID
  status: "active" | "committed" | "expired" | "released";
  expiresAt: Timestamp; // Current time + 15 minutes TTL
  createdAt: Timestamp;
}

export interface FirestoreCodRemittance {
  id: string; // "rem_202611_001"
  crnNumber: string; // Credit Reference Number from Shiprocket
  bankUtr: string; // Bank Transaction UTR
  courierName: string; // e.g. "Blue Dart Express"
  totalOrdersCount: number;
  totalBalanceCollectedInPaise: number; // Sum of balance amounts expected
  totalRemittedAmountInPaise: number; // Actual amount transferred to GutGlow bank
  discrepancyAmountInPaise: number; // totalBalanceCollected - totalRemitted
  status: "reconciled" | "discrepancy" | "pending_audit";
  matchedOrderNumbers: string[]; // ["GG-2611-000001", "GG-2611-000005"]
  remittedAt: Timestamp;
  reconciledBy: string; // Admin UID or "SYSTEM_CRON"
  notes?: string;
  createdAt: Timestamp;
}
```

---

### 3.15 Collection: `settings`

```typescript
export interface FirestoreStoreConfig {
  storeName: "GutGlow";
  contactEmail: "support@gutglow.com";
  supportPhone: "+91 98765 43210";
  sellerGstin: "27AAAAA0000A1Z5"; // Statutory [REQUIRES_CA_CONFIRMATION]
  sellerStateCode: "27"; // Maharashtra
  currency: "INR";
  
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
```

---

### 3.16 Collection: `adminLogs` (Immutable Audit Trail)

```typescript
export interface FirestoreAdminLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminRole: string;
  action: 
    | "UPDATE_PRODUCT_PRICE" 
    | "ADJUST_PHYSICAL_STOCK" 
    | "CREATE_BATCH" 
    | "CANCEL_ORDER" 
    | "APPROVE_RETURN" 
    | "PROCESS_REFUND" 
    | "RECONCILE_PARTIAL_COD_BALANCE" 
    | "UPDATE_STORE_SETTINGS";
  resourceType: "product" | "inventory" | "batch" | "order" | "return" | "coupon" | "settings";
  resourceId: string;
  beforeSnapshot?: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Timestamp;
}
```

---

## 4. COMPOSITE INDEX SPECIFICATIONS (`firestore.indexes.json`)

```json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "customer.uid", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "paymentMode", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "advancePaymentStatus", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "balanceCollectionStatus", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shipmentStatus", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "reviews",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "productId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "inventoryTransactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "sku", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "batches",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "expiryDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "adminLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "resourceType", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 5. PAGINATION & QUERY PERFORMANCE STRATEGY

Cursor-based pagination using `startAfter()` is mandatory for all large collections:

```typescript
export async function getPaginatedOrders(limitCount = 20, lastVisibleDocId?: string) {
  let query = db.collection("orders").orderBy("createdAt", "desc").limit(limitCount);
  
  if (lastVisibleDocId) {
    const lastDocSnap = await db.collection("orders").doc(lastVisibleDocId).get();
    if (lastDocSnap.exists) {
      query = query.startAfter(lastDocSnap);
    }
  }
  
  const snapshot = await query.get();
  const nextCursor = snapshot.docs.length === limitCount 
    ? snapshot.docs[snapshot.docs.length - 1].id 
    : null;
    
  return {
    orders: snapshot.docs.map(doc => doc.data() as FirestoreOrder),
    nextCursor,
    hasNextPage: Boolean(nextCursor),
  };
}
```
