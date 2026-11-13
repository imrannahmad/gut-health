# GUTGLOW — SERVER API ARCHITECTURE & ROUTE HANDLER SPECIFICATION

**Document Version:** 2.3.0 (Final Pre-Build Architecture Audit & Technical Corrections)  
**Framework:** Next.js 16.4.5 (App Router Server Route Handlers)  
**Runtime Requirement:** `export const runtime = 'nodejs'` (Explicit Node.js runtime for all Firebase Admin handlers)  
**Authentication Standard:** Firebase ID Token & HTTP-Only Encrypted Session Cookies  
**Data Validation Standard:** Zod Schema Enforcement  
**Monetary Standard:** Strict Integer Paise (INR)  
**Base Route URL:** `/api/v1/`  

---

## 1. REVISION CHANGE LOG

### v2.3.0 (Final Pre-Build Technical Audit Corrections)
- **Fastrr Checkout Initiation Handshake**: Added specification for `POST /api/v1/checkout/fastrr/initiate` with 15-minute stock reservation and collision-safe order reference generation (`GG-YYMM-XXXXXX`).
- **Delayed Payment & Expired Reservation Recovery**: Added detailed webhook logic for handling payments arriving after the 15-minute TTL, ensuring available stock is re-reserved or an immediate refund is flagged without overselling.
- **Strict Monetary Balance Reconciliation**: Added server-side validation ensuring `totalAmountInPaise === advanceAmountInPaise + balanceAmountInPaise` on all webhook ingestion.
- **Courier Remittance API Distinction**: Formally decoupled `DELIVERED` webhook status (`balanceCollectionStatus: "collected"`) from bank financial settlement (`POST /api/v1/admin/cod/reconcile` setting `"remitted"`).
- **Reservation Cleanup Endpoint**: Added `DELETE /api/v1/cron/cleanup-reservations` for automated release of expired reservations.
- **Safe Health Probe Bump**: Updated `/api/v1/health` response version to `2.3.0`.

### v2.2.0 (Confirmed Partial COD & Prepaid Payment Architecture)
| Area | v2.1.0 State | v2.2.0 Confirmed Model | Security & Operational Impact |
| :--- | :--- | :--- | :--- |
| **Supported Payment Modes** | Included generic COD flows. | **Full COD eliminated.** Exclusively supports **Full Prepaid** and **Partial COD** (online advance + balance on delivery). | Aligns with confirmed D2C business model to mitigate courier RTO losses. |
| **Advance & Balance Statuses** | Generic payment status flags. | Independent **`advancePaymentStatus`** and **`balanceCollectionStatus`** across all order endpoints. | Accurately models the financial state of uncollected delivery balances. |
| **Fulfillment Gating** | Unclear when Partial COD moves to dispatch. | **Successful online advance payment is mandatory** before an order is marked `confirmed` or eligible for AWB generation. | Eliminates bogus uncommitted orders from warehouse fulfillment queues. |
| **Courier Balance Remittance** | Treated delivery as payment settlement. | Delivery webhook sets `balanceCollectionStatus: "collected"`; courier bank settlement reconciles to `"remitted"`. | Accurately accounts for courier-held cash vs merchant bank funds. |
| **Fastrr Checkout Delegation** | Custom COD calculator implied. | Fastrr Checkout manages advance percentage calculation based on merchant settings; GutGlow backend records confirmed amounts. | Zero duplicate business logic between checkout provider and backend. |

---

## 2. API DESIGN STANDARDS & RESPONSE PROTOCOLS

### 2.1 Uniform Success Envelope
All successful API responses return an HTTP `200` or `201` status code with the following uniform envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-11-13T17:45:00.000Z",
    "requestId": "req_01HZX87Q...",
    "pagination": {
      "limit": 20,
      "hasNextPage": true,
      "nextCursor": "doc_id_sample"
    }
  }
}
```

### 2.2 Uniform Error Envelope
All error responses return semantic HTTP status codes (`400`, `401`, `403`, `404`, `409`, `422`, `429`, `500`) with actionable debugging metadata:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PHYSICAL_STOCK",
    "message": "Requested quantity exceeds available physical jars for formula GutGlow Daily Wellness.",
    "details": [
      {
        "field": "items[0].quantity",
        "issue": "Requested 3 physical jars (1 x 3-Month Pack), but only 2 physical jars remain in stock."
      }
    ],
    "requestId": "req_01HZX87Q...",
    "timestamp": "2026-11-13T17:45:00.000Z"
  }
}
```

---

## 3. AUTHENTICATION, CSRF & AUTHORIZATION GUARDS

```
INCOMING HTTP REQUEST
        │
        ▼
Is Route Public? (e.g. GET /api/v1/products)
   ├── YES ──> Execute Controller -> Return JSON
   └── NO
        │
        ▼
CSRF Protection Guard (for POST / PUT / PATCH / DELETE)
   ├── Verify Request Origin & Referer match allowed domains
   ├── Verify Header `X-GutGlow-Client: web` is present
   └── If check fails ──> Return 403 Forbidden ("CSRF Validation Failed")
        │
        ▼
Check Authorization Mechanism
   ├── Customer Route? ──> Verify Firebase ID Token via `authAdmin.verifyIdToken(token)`
   └── Admin Route? ───> Extract `gutglow_admin_session` cookie
                           │
                           ▼
                 `authAdmin.verifySessionCookie(cookie, true)` (checkRevoked = true)
                           │
                           ├── Invalid / Revoked ──> Return 401 Unauthorized
                           └── Valid
                                │
                                ▼
                 Verify RBAC Role in Token Claims
                 `hasPermission(claims.role, requiredPermission)`
                                │
                                ├── Denied ──> Return 403 Forbidden
                                └── Granted ──> Attach `context.admin` -> Execute & Log Mutation
```

---

## 4. STOREFRONT & CUSTOMER APIS

### 4.1 Product Catalog
#### `GET /api/v1/products`
- **Scope**: Public (Cached via Next.js ISR)
- **Description**: Returns all active products with cached aggregate ratings and available pack options. All prices in integer paise.

#### `GET /api/v1/products/[slug]`
- **Scope**: Public
- **Description**: Returns full product detail for `/product` page (images, pack options in paise, specs, directions).

---

### 4.2 Live Pincode Serviceability Check
#### `POST /api/v1/shipping/serviceability`
- **Scope**: Public (Rate-limited: 30 req/min per IP)
- **Description**: Queries Shiprocket courier serviceability API for delivery speed, estimated date, and Partial COD balance collection availability.
- **Request Body**:
```json
{
  "pincode": "400050",
  "weightGrams": 600,
  "paymentMode": "partial_cod"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "isServiceable": true,
    "courierName": "Blue Dart Express",
    "estimatedDays": 3,
    "estimatedDeliveryDate": "2026-11-16",
    "codAvailable": true,
    "shippingChargeInPaise": 0
  }
}
```

---

### 4.3 Server Cart Validation & Price Recalculation
#### `POST /api/v1/cart/validate`
- **Scope**: Public (Rate-limited: 60 req/min per IP)
- **Description**: Validates client cart items against authoritative Firestore pricing in paise and physical inventory stock (`quantityAvailable`).
- **Request Body**:
```json
{
  "items": [
    {
      "productId": "gutglow-daily-wellness",
      "packOptionId": "pack-3-month",
      "quantity": 1
    }
  ],
  "couponCode": "WELCOME10"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "items": [
      {
        "productId": "gutglow-daily-wellness",
        "packOptionId": "pack-3-month",
        "baseSku": "GG-DWF-200G",
        "name": "GutGlow Daily Wellness Formula — 3-Month Ritual",
        "packQuantity": 3,
        "quantity": 1,
        "totalPhysicalJars": 3,
        "unitSellingPriceInPaise": 489900,
        "mrpInPaise": 749700,
        "lineGrossTotalInPaise": 489900,
        "inStock": true
      }
    ],
    "pricing": {
      "currency": "INR",
      "grossProductAmountInPaise": 489900,
      "discountAmountInPaise": 48900,
      "couponCode": "WELCOME10",
      "netProductPayableInPaise": 441000,
      "taxableValueInPaise": 373729,
      "totalGstAmountInPaise": 67271,
      "shippingFeeInPaise": 0,
      "totalAmountInPaise": 441000
    }
  }
}
```
*Note: Fastrr Checkout handles the advance percentage split during checkout initiation based on merchant dashboard configuration.*

---

### 4.4 Checkout Initiation & Stock Reservation Hold (Phase 17)
#### `POST /api/v1/checkout/fastrr/initiate`
- **Scope**: Public (Rate-limited: 30 req/min per IP)
- **Description**: Validates server-side cart, allocates a collision-safe Order Reference (`GG-YYMM-XXXXXX`), places a 15-minute temporary reservation in `inventoryReservations`, and requests a Fastrr Headless Checkout session.
- **Request Body**:
```json
{
  "items": [
    {
      "productId": "gutglow-daily-wellness",
      "packOptionId": "pack-3-month",
      "quantity": 1
    }
  ],
  "couponCode": "WELCOME10",
  "customer": {
    "phone": "9876543210",
    "email": "customer@example.com"
  }
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "orderNumber": "GG-2611-000001",
    "reservationId": "res_01HZX87Q...",
    "reservationExpiresAt": "2026-11-13T18:00:00.000Z",
    "fastrrSessionToken": "fst_tok_8492019...",
    "checkoutUrl": "https://fastrr.shiprocket.in/checkout?session=fst_tok_8492019..."
  }
}
```
*[REQUIRES_FASTRR_PARTNER_DOCS_CONFIRMATION for exact Fastrr Session API request payload]*.

---

### 4.5 Dual-Tier Order Tracking Security

#### Tier 1: Public Quick Track (Masked Summary)
- **Endpoint**: `POST /api/v1/orders/track`
- **Scope**: Public (Rate-limited: 5 req/10 min per IP)
- **Description**: Powers `app/track-order/page.tsx` with live timeline events, current shipment status, and courier tracking URL while strictly masking customer PII.
- **Request Body**:
```json
{
  "orderNumber": "GG-2611-000001",
  "phoneNumber": "9876543210"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "orderNumber": "GG-2611-000001",
    "orderStatus": "processing",
    "paymentMode": "partial_cod",
    "advancePaymentStatus": "captured",
    "balanceCollectionStatus": "pending_delivery",
    "balanceDueInPaise": 179910,
    "shipmentStatus": "in_transit",
    "customer": {
      "maskedName": "I**** K***",
      "maskedCity": "Mu****",
      "stateCode": "27"
    },
    "shipment": {
      "courierName": "Blue Dart Express",
      "awbNumber": "EXP-BLUEDART-984210",
      "trackingUrl": "https://www.bluedart.com/tracking/...",
      "estimatedDeliveryDate": "2026-11-16"
    },
    "timeline": [
      {
        "status": "ORDER_CREATED",
        "description": "Order received with Partial COD.",
        "timestamp": "2026-11-13T10:00:00Z"
      },
      {
        "status": "ADVANCE_PAYMENT_CAPTURED",
        "description": "Online advance payment confirmed.",
        "timestamp": "2026-11-13T10:02:15Z"
      },
      {
        "status": "IN_TRANSIT",
        "description": "Package picked up by Blue Dart courier.",
        "timestamp": "2026-11-13T14:30:00Z"
      }
    ]
  }
}
```

#### Tier 2: Full Order Details & Invoice Download (Verified Access)
- **Endpoint**: `POST /api/v1/orders/verify-token` or Authenticated Route `GET /api/v1/customer/orders/[orderId]`
- **Scope**: Authenticated Customer OR Valid Short-Lived Signed Token (`?token=...`, 24-hr TTL)
- **Description**: Returns unmasked shipping address, line items with batch numbers, and official CGST Rule 46 PDF Tax Invoice download URL displaying advance received and balance due.

---

## 5. ADMINISTRATIVE APIS (`/api/v1/admin/*`)

All administrative endpoints require a valid `gutglow_admin_session` cookie and are guarded by role-based access validation. Every state-changing write automatically writes an immutable log to `adminLogs`.

### 5.1 Order Management
| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/orders` | `orders.read` | Paginated list filterable by `paymentMode`, `advancePaymentStatus`, `balanceCollectionStatus`, `shipmentStatus`, date |
| `GET` | `/api/v1/admin/orders/[id]` | `orders.read` | Full order detail: advance paid, balance due, and timeline |
| `PATCH`| `/api/v1/admin/orders/[id]/status`| `orders.write` | Update order state (advance capture required for dispatch) |
| `POST` | `/api/v1/admin/orders/[id]/shipment`| `orders.write` | Push order to Shiprocket (collectible value = `balanceAmountInPaise`) |
| `GET` | `/api/v1/admin/orders/[id]/label` | `orders.read` | Download printable thermal shipping label PDF |
| `GET` | `/api/v1/admin/orders/[id]/invoice`| `orders.read` | Download official Rule 46 CGST Tax Invoice PDF |
| `POST` | `/api/v1/admin/orders/[id]/cancel` | `orders.write` | Cancel order, void AWB, release physical stock |

---

### 5.2 Partial COD Remittance & Financial Reconciliation
| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/admin/cod/reconcile` | `financials.write` | Ingest Shiprocket Remittance Manifest (CRN/UTR); reconcile balance collections |
| `GET` | `/api/v1/admin/cod/discrepancies`| `financials.read` | List orders flagged with `balanceCollectionStatus: "discrepancy"` |
| `POST` | `/api/v1/admin/cod/resolve-discrepancy`| `financials.write`| Mark discrepancy resolved with audit note |
| `DELETE`| `/api/v1/cron/cleanup-reservations` | `internal.cron` | Periodic job expiring stale reservations (>15 mins) and restoring stock |

---

### 5.3 Product & Catalog Management
| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/products` | `products.read` | List all products including drafts & archived |
| `POST` | `/api/v1/admin/products` | `products.write` | Create new product, upload images to Storage |
| `PUT` | `/api/v1/admin/products/[id]` | `products.write` | Full update of specifications, variants, pricing in paise |
| `PATCH`| `/api/v1/admin/products/[id]/status`| `products.write`| Toggle status (`active` / `draft` / `archived`) |
| `DELETE`| `/api/v1/admin/products/[id]` | `products.delete` | Soft delete product |

---

### 5.4 Physical Inventory & Batch Control
| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/inventory` | `inventory.read` | List real-time physical stock levels and low-stock alerts |
| `POST` | `/api/v1/admin/inventory/adjust` | `inventory.write` | Transactional manual physical stock count override |
| `GET` | `/api/v1/admin/inventory/batches`| `inventory.read` | List manufacturing batches with expiry and status |
| `POST` | `/api/v1/admin/inventory/batches`| `inventory.write` | Create new manufacturing batch (FSSAI compliance) |

---

### 5.5 Returns, Replacements & Refunds
| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/returns` | `returns.read` | List return requests with photo evidence links |
| `POST` | `/api/v1/admin/returns/[id]/inspect`| `returns.write` | Record physical inspection result and set `restockEligible` |
| `POST` | `/api/v1/admin/refunds/process` | `financials.write` | Process refund via payment gateway in paise |

---

### 5.6 Audit Logs & Executive Analytics
| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/logs` | `audit.read` (Super Admin) | Immutable administrative action history |
| `GET` | `/api/v1/admin/analytics/dashboard`| `financials.read` | Aggregated executive KPIs (Revenue, Advance, Balance, AOV) |

---

## 6. WEBHOOK INGESTION ARCHITECTURE

### 6.1 Fastrr Headless Checkout Webhook (Phase 17)
- **Endpoint**: `POST /api/v1/webhooks/fastrr`
- **Security**: Cryptographic HMAC-SHA256 signature verification over raw request body using `FASTRR_WEBHOOK_SECRET`:
  ```typescript
  const signature = headers().get("x-fastrr-signature");
  const computedHash = crypto
    .createHmac("sha256", process.env.FASTRR_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  if (signature !== computedHash) {
    return NextResponse.json({ error: "Invalid Signature" }, { status: 401 });
  }
  ```
  *[REQUIRES_FASTRR_PARTNER_DOCS_CONFIRMATION for exact signature header and hashing scheme]*.
- **Idempotency & Concurrency Check**:
  - Checks `processedWebhooks/fastrr_{eventId}`. If present, returns HTTP 200 immediately.
  - Verifies that target order has not already reached `confirmed` or higher status.
- **Financial Balance Validation**:
  - Recomputes and verifies: `advanceAmountInPaise + balanceAmountInPaise === totalAmountInPaise`.
  - For `prepaid`: `balanceAmountInPaise === 0`.
  - For `partial_cod`: `advanceAmountInPaise > 0` and `balanceAmountInPaise > 0`.
- **Events Handled**:
  - `order.successful`:
    - Sets `advancePaymentStatus: "captured"`.
    - Sets `balanceCollectionStatus: paymentMode === "partial_cod" ? "pending_delivery" : "not_applicable"`.
    - Sets `orderStatus: "confirmed"`.
    - Atomically creates Firestore `orders` document, decrements `quantityReserved` and `quantityTotal` on physical SKU (`inventory/GG-DWF-200G`), allocates oldest batches via **FEFO** (`inventory/{sku}/batches`), records event in `processedWebhooks`, and dispatches order confirmation notification.
  - `payment.failed`:
    - Records attempt in `orders/{orderId}/paymentAttempts` subcollection; releases reserved physical stock back to `quantityAvailable`.
  - **Delayed Payment & Expired Reservation Recovery**:
    - If customer completed checkout after the 15-minute reservation expired, the cleaner will have released the reservation.
    - Webhook handler re-inspects `inventory/GG-DWF-200G.quantityAvailable`.
    - **Stock Available**: Re-reserves stock, allocates batches via FEFO, confirms order, and continues normal fulfillment.
    - **Stock Sold Out**: Transitions order to `orderStatus: "stock_exhausted_pending_refund"`, flags urgent notification to admin, and records refund transaction.

---

### 6.2 Shiprocket Tracking Webhook
- **Endpoint**: `POST /api/v1/webhooks/shiprocket`
- **Security**: Verifies security token header (`x-api-key == process.env.SHIPROCKET_WEBHOOK_SECRET`). *[REQUIRES_OFFICIAL_DOCS_VERIFICATION]*.
- **Workflow**:
  1. Idempotency Check: Verify if `processedWebhooks/shiprocket_{eventId}` exists; if so, return HTTP 200 immediately.
  2. Parse AWB number and current tracking code from payload.
  3. Find matching order in Firestore via query `where("shipment.awbNumber", "==", awb)`.
  4. Map Shiprocket tracking status (`PICKED UP`, `DELIVERED`, `RTO`) to decoupled `shipmentStatus`.
  5. **Partial COD Balance Separation**: If status is `DELIVERED` and `paymentMode === "partial_cod"`, set `balanceCollectionStatus: "collected"` (*courier has collected cash; merchant bank has NOT received funds*).
  6. Financial settlement (`balanceCollectionStatus: "remitted"`) happens strictly via Remittance Advice ingestion (`/api/v1/admin/cod/reconcile`), NOT this delivery webhook.
  7. Append event to `orders/{orderId}/events` subcollection.
  8. If status is `DELIVERED`, trigger customer email with GutGlow morning ritual usage guide.

---

## 7. SAFE HEALTH-CHECK ENDPOINT

#### `GET /api/v1/health`
- **Scope**: Public / Monitoring Probes
- **Security**: Read-only latency probe. Zero database writes. Zero internal credential or project leaks.
- **Response**:
```json
{
  "status": "healthy",
  "version": "2.3.0",
  "timestamp": "2026-11-13T17:45:00.000Z"
}
```
