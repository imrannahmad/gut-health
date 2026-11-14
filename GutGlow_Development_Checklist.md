# GUTGLOW — BACKEND & ADMIN PANEL DEVELOPMENT MASTER CHECKLIST

**Project:** GutGlow D2C E-Commerce Platform  
**Document Version:** 2.3.1 (Final Pre-Build Consistency Corrections)  
**Target Architecture:** Next.js 16.4.5 (App Router) · React 19 · Firebase (Firestore, Auth, Storage) · Shiprocket · Fastrr  
**Strict Completion Rule:** No phase is marked complete based solely on code generation. A phase is officially complete ONLY when all phase-specific automated test suites and manual verification tests execute with zero errors.  

---

## REVISION CHANGE LOG

### v2.3.1 (Final Pre-Build Consistency Corrections)
- **Delivery vs Cash Collection Separation**: Task 15.7 updated so that `DELIVERED` event transitions `balanceCollectionStatus` to `awaiting_collection_confirmation`. Physical delivery is not treated as proof of cash collection. Cash collection is confirmed via verified COD event or admin reconciliation in Task 16.14.
- **Order Number Non-Gapless Model**: Task 10.1 updated to document that `GG-YYMM-XXXXXX` guarantees unique sequential allocation, but is non-gapless due to abandoned checkouts, failed payments, and retries.
- **Fastrr Integration Partner Tagging**: Marked all Fastrr checkout tasks in Phase 17 with `[REQUIRES_FASTRR_PARTNER_DOCS_CONFIRMATION]`.
- **Firebase Regional Independence**: Reaffirmed independent availability of Firestore Native and Cloud Storage in `asia-south1` (Mumbai) as a proposed region pending explicit user written approval.
- **Safe Health-Check Version**: Updated Task 1.9 to assert `{ status: "healthy", version: "2.3.1" }`.

### v2.3.0 (Final Pre-Build Technical Audit Corrections)
- **Phased Firebase Setup**: Phase 01 now creates **ONLY `gutglow-development`** and configures the Firebase Local Emulator Suite. Creation of `gutglow-production` and Vercel production secrets configuration are strictly **deferred to Phase 18**.
- **Permanent Region Approval Gate**: Clarified that Firestore locations are permanent and cannot be altered. Cloud database provisioning in Phase 02 remains blocked until explicit user written approval for `asia-south1` (Mumbai).
- **Fastrr Checkout Initiation Handshake**: Added tasks in Phase 17 for `POST /api/v1/checkout/fastrr/initiate` with 15-minute stock reservation holds in `inventoryReservations`.
- **Sequential vs Sharded Counter Tasks**: Clarified Task 10.1 single-document transaction for strict sequential orders vs distributed shards for flash sale uniqueness.
- **Courier Remittance Reconciliation**: Added specific tasks in Phase 15 and 16 for matching Shiprocket Remittance Advice (CRN/UTR) to reconcile balances from `collected` to `remitted`.
- **Safe Health-Check Version**: Updated Task 1.9 to assert `{ status: "healthy", version: "2.3.0" }`.

### v2.2.0 (Confirmed Partial COD & Prepaid Payment Architecture)
- **Confirmed Payment Modes**: Eliminated generic/full COD. All payment tasks now strictly reflect **Full Prepaid** and **Partial COD** (online advance + remaining balance on delivery).
- **Payment & Balance Separation**: Added tasks across Phase 02, 10, 15, and 16 tracking `advancePaymentStatus` and `balanceCollectionStatus` independently.
- **Partial COD Fulfillment Gate**: Phase 10 now enforces that online advance payment must be verified before an order moves to warehouse fulfillment.
- **Courier Remittance Reconciliation**: Added tasks in Phase 15 and 16 for Shiprocket balance collection verification and bank remittance reconciliation.
- **Fastrr Configuration Delegation**: Documented that advance percentage is configured in Fastrr Checkout merchant settings rather than hardcoded in GutGlow.
- **Refund Policy Status**: Noted in Phase 13 that refund and cancellation rules are not finalized yet and remain extensible.

---

## PHASE 01 — Firebase Project Creation & Development Environment Setup

- [x] **Task 1.1 (USER APPROVAL GATE)**: Verify user has provided explicit written approval to proceed with region **`asia-south1` (Mumbai, India)**, acknowledging that Firestore database locations cannot be altered after creation. *(Approved on 2026-11-14)*
- [x] **Task 1.2**: Create Firebase Project `gutglow-development` in Google Cloud / Firebase Console. *(Completed)*
- [x] **Task 1.3**: Register Web App in `gutglow-development` and extract Client SDK configuration object. *(Completed)*
- [x] **Task 1.4**: Set up Firebase Local Emulator Suite (`firebase-tools`) for local development (Auth on port 9099, Firestore on port 8080) so local development requires zero cloud credentials. *(Completed via `firebase.json`, `firestore.rules`, `storage.rules`)*
- [x] **Task 1.5**: Configure `.env.local` for development and emulator use, strictly verifying it is gitignored in `.gitignore`. *(Verified & Configured)*
- [x] **Task 1.6**: Install `firebase` and `firebase-admin` dependencies in `package.json`. *(Completed: firebase v13, firebase-admin v14)*
- [x] **Task 1.7**: Implement singleton client module `lib/firebase/client.ts` with lazy initialization guard for Next.js HMR and emulator connect support. *(Completed)*
- [x] **Task 1.8**: Implement singleton admin module `lib/firebase/admin.ts` ensuring private key newline parsing. *(Completed)*
- [x] **Task 1.9**: Implement safe, read-only server smoke-test route `app/api/v1/health/route.ts` (zero writes) and verify HTTP 200 response `{ status: "healthy", version: "2.3.1" }`. *(Verified HTTP 200)*
- *Note: Production Firebase project creation (`gutglow-production`) and Vercel production secrets configuration are strictly deferred to Phase 18.*

---

## PHASE 02 — Cloud Firestore Architecture & Schema Modeling

- [x] **Task 2.1**: Provision Cloud Firestore in Native Mode in region `asia-south1` (Mumbai) in `gutglow-development` project only (post user approval). *(Completed & Verified)*
- [x] **Task 2.2**: Author TypeScript interfaces in `types/firestore/*.ts` enforcing the **integer paise standard** for all monetary values. *(Completed in `types/firestore/`)*
- [x] **Task 2.3**: Model physical base SKU `GG-DWF-200G` with standardized fields `quantityAvailable`, `quantityReserved`, `quantityTotal`. *(Completed in `types/firestore/inventory.ts`)*
- [x] **Task 2.4**: Model batch/lot tracking schema (`inventory/{sku}/batches`) with `quantityInitial`, `quantityAvailable`, `quantitySold`, `quantityQuarantined`, and `status`. *(Completed in `types/firestore/inventory.ts`)*
- [x] **Task 2.5**: Model confirmed payment modes (`paymentMode: "prepaid" | "partial_cod"`) with decoupled `advancePaymentStatus` and `balanceCollectionStatus`. *(Completed in `types/firestore/order.ts`)*
- [x] **Task 2.6**: Model financial fields (`totalAmountInPaise`, `advanceAmountInPaise`, `balanceAmountInPaise`) in order schema. *(Completed in `types/firestore/order.ts`)*
- [x] **Task 2.7**: Model `orders/{orderId}/paymentAttempts` subcollection to track gateway transaction attempts independently. *(Completed in `types/firestore/order.ts`)*
- [x] **Task 2.8**: Model legal tax invoice metadata schema compliant with Rule 46 of CGST Rules (HSN `2106 90 99` [REQUIRES_CA_CONFIRMATION]). *(Completed in `types/firestore/order.ts`)*
- [x] **Task 2.9**: Model store configuration in `settings/store_config` separating business policies (`minShelfLifeMonthsAtDispatch`, `returnWindowDays`) from statutory data. *(Completed in `types/firestore/store.ts`)*
- [x] **Task 2.10**: Deploy composite index specifications via `firestore.indexes.json`. *(Completed in `firestore.indexes.json`)*
- [x] **Task 2.11**: Implement base repository pattern abstraction in `lib/repositories/baseRepository.ts`. *(Completed in `lib/repositories/baseRepository.ts`)*
- [x] **Task 2.12**: Author and run local Firestore schema validation test script against emulator asserting 100% type safety. *(Completed: 100% Pass in `scripts/validate-schemas.ts`)*

---

## PHASE 03 — Firebase Authentication & Admin Security

- [x] **Task 3.1**: Enable Email/Password and Google Sign-in providers in Firebase Console. *(Completed in console)*
- [x] **Task 3.2**: Implement session cookie issuance endpoint `POST /api/v1/auth/session` with `SameSite=Strict`, `HttpOnly`, and `Secure` flags (5-day duration). *(Completed in `app/api/v1/auth/session/route.ts`)*
- [x] **Task 3.3**: Implement session revocation endpoint `POST /api/v1/auth/logout`. *(Completed in `app/api/v1/auth/logout/route.ts`)*
- [x] **Task 3.4**: Create admin claims bootstrap script `scripts/assign-admin-claim.ts`. *(Completed in `scripts/assign-admin-claim.ts`)*
- [x] **Task 3.5**: Run bootstrap script to assign initial `super_admin` role to owner email. *(Completed: `imrannahmd@gmail.com` registered as `super_admin`)*
- [x] **Task 3.6**: Implement admin RBAC permission matrix and verification helper in `lib/auth/rbac.ts`. *(Completed in `lib/auth/rbac.ts`)*
- [x] **Task 3.7**: Implement Server Layout Guard in `app/admin/layout.tsx` enforcing valid session cookie, active claim, and role permissions. *(Completed in `app/admin/layout.tsx` & `/admin/login`)*
- [x] **Task 3.8**: Wire customer authentication into `app/account/page.tsx` replacing mock state. *(Completed: Live Firebase Auth Email/Password + Google Sign-In with Firestore sync)*

---

## PHASE 04 — Firebase Security Rules & App Check

- [x] **Task 4.1**: Author declarative security rules in `firestore.rules` enforcing Deny-by-Default (zero direct client writes to `orders`, `inventory`, `coupons`, or `adminLogs`). *(Completed in `firestore.rules`)*
- [x] **Task 4.2**: Author storage access rules in `storage.rules` enforcing file-size (max 5MB) and mime-type constraints. *(Completed in `storage.rules`)*
- [x] **Task 4.3**: Author security rules unit test suite in `scripts/test-security-rules.ts`. *(Completed in `scripts/test-security-rules.ts`)*
- [x] **Task 4.4**: Execute rules test suite and assert all unauthenticated writes fail with permission denied. *(Completed: 13/13 Assertions 100% Passed against live Firestore)*
- [x] **Task 4.5**: Deploy rules to development project via Google Cloud Firebase Rules Engine. *(Completed: Deployed live via `scripts/deploy-rules.ts`)*
- [x] **Task 4.6**: Configure Firebase App Check client & server verifiers to reject unauthorized API probes. *(Completed in `lib/firebase/appCheck.ts` & `lib/firebase/appCheckServer.ts`)*

---

## PHASE 05 — Product Catalog & Media Pipeline

- [ ] **Task 5.1**: Implement `ProductRepository` in `lib/repositories/productRepository.ts`.
- [ ] **Task 5.2**: Implement `ProductService` in `lib/services/productService.ts` linking pack options (1x, 2x, 3x) to base physical SKU `GG-DWF-200G`.
- [ ] **Task 5.3**: Author Zod product validation schema in `lib/validations/productSchema.ts` with prices in integer paise.
- [ ] **Task 5.4**: Create public route handlers `GET /api/v1/products` and `GET /api/v1/products/[slug]`.
- [ ] **Task 5.5**: Create admin CRUD route handlers `POST`, `PUT`, `DELETE` under `/api/v1/admin/products`.
- [ ] **Task 5.6**: Build Firebase Storage image upload pipeline with automatic file naming and thumbnail generation.
- [ ] **Task 5.7**: Author and execute seed script `scripts/seed-products.ts` loading flagship GutGlow formula in integer paise.
- [ ] **Task 5.8**: Connect storefront `/product` page to live Firestore data with static fallback.

---

## PHASE 06 — Category Management Backend

- [ ] **Task 6.1**: Implement `CategoryRepository` and `CategoryService` in `lib/services/categoryService.ts`.
- [ ] **Task 6.2**: Create category route handlers `GET /api/v1/categories` and `/api/v1/admin/categories`.
- [ ] **Task 6.3**: Seed primary categories ("Gut Wellness Nutraceuticals", "Daily Rituals").
- [ ] **Task 6.4**: Connect category selection dropdown into product creation and editing workflows.

---

## PHASE 07 — Safe Transactional Physical Inventory & Batch Engine

- [ ] **Task 7.1**: Implement `InventoryRepository` tracking physical stock at base SKU `GG-DWF-200G` with fields `quantityAvailable`, `quantityReserved`, `quantityTotal`.
- [ ] **Task 7.2**: Implement SKU-level reservation engine with 15-minute TTL lock in `inventoryReservations/{id}`.
- [ ] **Task 7.3**: Implement order confirmation batch allocation service assigning active batches via FEFO (filtering `minShelfLifeMonthsAtDispatch`).
- [ ] **Task 7.4**: Implement inventory reconciliation service (`lib/services/inventoryReconciliation.ts`) verifying `sum(batches.quantityAvailable) == inventory.quantityAvailable + inventory.quantityReserved`.
- [ ] **Task 7.5**: Implement immutable audit ledger writing to `inventoryTransactions` collection.
- [ ] **Task 7.6**: Create admin physical stock adjustment endpoint `POST /api/v1/admin/inventory/adjust`.
- [ ] **Task 7.7**: Author concurrency race condition test asserting 0 overselling when 20 requests contend for 2 physical jars.

---

## PHASE 08 — Customer Management & Address Book Backend

- [ ] **Task 8.1**: Create user auto-provisioning hook triggering on new customer registration.
- [ ] **Task 8.2**: Implement multi-address management endpoints under `/api/v1/customer/addresses` with 6-digit Indian PIN code and GST state code validation.
- [ ] **Task 8.3**: Connect customer profile and address book to `/account` page.
- [ ] **Task 8.4**: Create admin customer CRM directory and detail endpoints `/api/v1/admin/customers`.
- [ ] **Task 8.5**: Implement internal customer support notes subcollection.

---

## PHASE 09 — Cart & Wishlist Server-Side Synchronization

- [ ] **Task 9.1**: Create server-side cart calculation and validation endpoint `/api/v1/cart/validate` enforcing integer paise and checking physical stock.
- [ ] **Task 9.2**: Implement authenticated cart merge service syncing `localStorage` (`gutglow_cart_v1`) to `carts/{uid}`.
- [ ] **Task 9.3**: Update `lib/cart-context.tsx` with seamless offline-to-online hydration without altering existing UI.
- [ ] **Task 9.4**: Implement customer wishlist endpoint `/api/v1/wishlist`.

---

## PHASE 10 — Order Management Engine & State Machine

- [ ] **Task 10.1**: Implement collision-safe unique sequential Order ID generator (`GG-YYMM-XXXXXX`) via atomic transaction on `counters/orders_YYYYMM` (documenting non-gapless allocation due to abandoned checkouts, failed payments, and retries).
- [ ] **Task 10.2**: Implement decoupled quad-status state machine (`orderStatus`, `paymentMode`, `advancePaymentStatus`, `balanceCollectionStatus`, `shipmentStatus`).
- [ ] **Task 10.3**: Enforce Partial COD rule: advance payment must be captured before order is marked `confirmed` or eligible for fulfillment.
- [ ] **Task 10.4**: Build transactional order creation service capturing immutable product snapshots, FEFO batch allocations, advance amount, balance due, and GST breakdown.
- [ ] **Task 10.5**: Implement audit event logger writing to `orders/{orderId}/events` subcollection.
- [ ] **Task 10.6**: Implement Dual-Tier Order Tracking: Tier 1 (`POST /api/v1/orders/track` returning masked summary with balance due); Tier 2 (Signed 24-hr token or Auth session for full PII/invoices).
- [ ] **Task 10.7**: Wire secure tracking endpoint to `app/track-order/page.tsx`.
- [ ] **Task 10.8**: Create admin order listing, filtering, and detail endpoints `/api/v1/admin/orders`.

---

## PHASE 11 — Promotional Engine, Coupons & Pricing Rules

- [ ] **Task 11.1**: Implement coupon validation service in `lib/services/couponService.ts` using integer paise.
- [ ] **Task 11.2**: Create public coupon validation endpoint `POST /api/v1/coupons/validate`.
- [ ] **Task 11.3**: Implement atomic usage increment inside order placement transaction to prevent race conditions.
- [ ] **Task 11.4**: Create admin coupon CRUD endpoints `/api/v1/admin/coupons`.
- [ ] **Task 11.5**: Test coupon minimum order value, expiration, and single-use constraints.

---

## PHASE 12 — Customer Reviews & Ratings Aggregator

- [ ] **Task 12.1**: Implement review submission service with verified purchase validation.
- [ ] **Task 12.2**: Build review moderation workflow (`pending` -> `approved` | `rejected`).
- [ ] **Task 12.3**: Implement atomic rating aggregation updating product `averageRating` and `reviewCount`.
- [ ] **Task 12.4**: Create public endpoint `GET /api/v1/reviews?productId=...`.
- [ ] **Task 12.5**: Create admin review moderation endpoints `/api/v1/admin/reviews`.

---

## PHASE 13 — Returns, Replacements & Refunds Engine

- [ ] **Task 13.1**: Implement configurable return eligibility validator reading `settings/store_config.returnWindowDays` and `returnPolicyType`.
- [ ] **Task 13.2**: Create customer return request endpoint `POST /api/v1/returns/request` with damage photo upload to Storage.
- [ ] **Task 13.3**: Create admin return inspection endpoint `POST /api/v1/admin/returns/[id]/inspect` with `restockEligible` evaluation.
- [ ] **Task 13.4**: Build extensible refund ledger supporting `refund_required`, `refund_pending`, `refunded`, `refund_failed` (formal policy deferred).

---

## PHASE 14 — Omnichannel Event-Driven Notification System

- [ ] **Task 14.1**: Define abstract `NotificationProvider` interface in `lib/notifications/types.ts`.
- [ ] **Task 14.2**: Design luxury HTML email templates displaying advance paid, balance due (if Partial COD), itemized tax breakdown, and tracking link.
- [ ] **Task 14.3**: Implement event listener triggering notifications asynchronously on order status transitions.
- [ ] **Task 14.4**: Implement low-stock alert dispatcher sending email to admin team.
- [ ] **Task 14.5**: Create notification audit log in `notifications` collection.

---

## PHASE 15 — Shiprocket Logistics & Real-Time Tracking Engine

- [ ] **Task 15.1**: Implement Shiprocket API authentication and token caching service.
- [ ] **Task 15.2**: Connect live Shiprocket serviceability API to `PincodeChecker` component on `/product` with Partial COD availability check.
- [ ] **Task 15.3**: Build shipment creation service passing `balanceAmountInPaise` as the COD collectible value.
- [ ] **Task 15.4**: Implement printable thermal shipping label fetcher endpoint.
- [ ] **Task 15.5**: Create Shiprocket webhook receiver `POST /api/v1/webhooks/shiprocket`.
- [ ] **Task 15.6**: Confirm static security token header (`x-api-key`) with official Shiprocket docs *[REQUIRES_OFFICIAL_DOCS_VERIFICATION]*.
- [ ] **Task 15.7**: Ensure delivery webhook sets `balanceCollectionStatus: "awaiting_collection_confirmation"` for Partial COD orders (cash collection is confirmed via verified COD event or manual reconciliation, not assumed on delivery).
- [ ] **Task 15.8**: Implement webhook idempotency check against `processedWebhooks` collection.

---

## PHASE 16 — Complete Custom Admin Panel Development

- [ ] **Task 16.1**: Build responsive Admin Shell layout (`/admin/layout.tsx`) with luxury styling and sidebar.
- [ ] **Task 16.2**: Implement dedicated Admin Login page (`/admin/login/page.tsx`).
- [ ] **Task 16.3**: Build Executive Dashboard (`/admin/page.tsx`) with live KPI metrics (Gross Revenue, Advance Collected, Balance Outstanding, AOV).
- [ ] **Task 16.4**: Build Order Management Console (`/admin/orders`) with `paymentMode`, `advancePaymentStatus`, and `balanceCollectionStatus` filters.
- [ ] **Task 16.5**: Build Order Detail View (`/admin/orders/[orderId]`) with advance breakdown, balance due, AWB generation, and packing slip.
- [ ] **Task 16.6**: Build Product Catalog Manager (`/admin/products`) with status toggles.
- [ ] **Task 16.7**: Build Multi-Step Product Editor (`/admin/products/[productId]`) with image uploader and pack matrix.
- [ ] **Task 16.8**: Build Category Manager (`/admin/categories`).
- [ ] **Task 16.9**: Build Physical Inventory & Batch Console (`/admin/inventory`) with stock adjustment modal and batch management.
- [ ] **Task 16.10**: Build Customer CRM view (`/admin/customers`).
- [ ] **Task 16.11**: Build Coupon Management view (`/admin/coupons`).
- [ ] **Task 16.12**: Build Review Moderation view (`/admin/reviews`).
- [ ] **Task 16.13**: Build Returns & Replacements view (`/admin/returns`).
- [ ] **Task 16.14**: Build Partial COD Remittance & Financial Reconciliation console (`/admin/cod-reconciliation`) supporting both manual delivery run-sheet cash collection verification and automated Shiprocket Remittance Advice (CRN/UTR) reconciliation.
- [ ] **Task 16.15**: Build Tax Invoices console (`/admin/invoices`) for CGST Rule 46 PDF downloads.
- [ ] **Task 16.16**: Build Store Settings view (`/admin/settings`).
- [ ] **Task 16.17**: Build Immutable Audit Log viewer (`/admin/logs`).
- [ ] **Task 16.18**: Verify every administrative write mutation creates an immutable record in `adminLogs`.

---

## PHASE 17 — Fastrr Headless Checkout Integration (FINAL CHECKOUT PHASE)

- [ ] **Task 17.1**: Configure Full Prepaid and Partial COD payment options in Fastrr merchant dashboard.
- [ ] **Task 17.2**: Confirm official Fastrr custom Next.js App Router headless documentation, SDK scripts, and webhook signatures with partner engineering *[REQUIRES_FASTRR_PARTNER_DOCS_CONFIRMATION]*.
- [ ] **Task 17.3**: Configure Fastrr Staging API keys in development environment.
- [ ] **Task 17.4**: Implement checkout session creation endpoint `/api/v1/checkout/fastrr/initiate` verifying paise pricing and physical stock *[REQUIRES_FASTRR_PARTNER_DOCS_CONFIRMATION]*.
- [ ] **Task 17.5**: Wire Fastrr headless checkout launcher to "Buy Now" and Cart Drawer *[REQUIRES_FASTRR_PARTNER_DOCS_CONFIRMATION]*.
- [ ] **Task 17.6**: Implement Fastrr webhook receiver `POST /api/v1/webhooks/fastrr` *[REQUIRES_FASTRR_PARTNER_DOCS_CONFIRMATION]*.
- [ ] **Task 17.7**: Implement HMAC-SHA256 cryptographic webhook signature verification *[REQUIRES_FASTRR_PARTNER_DOCS_CONFIRMATION]*.
- [ ] **Task 17.8**: Ingest verified advance payment and outstanding balance from Fastrr webhook payload *[REQUIRES_FASTRR_PARTNER_DOCS_CONFIRMATION]*.
- [ ] **Task 17.9**: Implement webhook idempotency check against `processedWebhooks` collection.
- [ ] **Task 17.10**: Wire atomic Firestore order creation, FEFO batch allocation, physical stock deduction, and notification dispatch.
- [ ] **Task 17.11**: Test end-to-end sandbox purchase flow across Full Prepaid and Partial COD.

---

## PHASE 18 — Production Infrastructure Provisioning, Security Audit & Launch

- [ ] **Task 18.1**: Create isolated production Firebase Project `gutglow-production` in Google Cloud / Firebase Console.
- [ ] **Task 18.2**: Provision production Cloud Firestore Native Mode database in approved region (`asia-south1`).
- [ ] **Task 18.3**: Provision production Firebase Storage bucket in approved region (`asia-south1`).
- [ ] **Task 18.4**: Configure production credentials (`FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`, production Fastrr & Shiprocket keys) in Vercel Secret Manager.
- [ ] **Task 18.5**: Deploy declarative Firestore Security Rules, Storage Rules, and Composite Indexes to production.
- [ ] **Task 18.6**: Execute automated end-to-end test suite (`tests/e2e/checkout-flow.test.ts`) across Full Prepaid and Partial COD flows.
- [ ] **Task 18.7**: Execute concurrency stress test on physical inventory reservations and delayed webhook recovery.
- [ ] **Task 18.8**: Perform security audit asserting zero credential leaks, least-privilege IAM, and CSRF protection.
- [ ] **Task 18.9**: Configure HTTP security headers (CSP, HSTS, X-Frame-Options) in `next.config.ts`.
- [ ] **Task 18.10**: Configure automated daily Cloud Firestore backups via Google Cloud Scheduled Backups.
- [ ] **Task 18.11**: Execute live ₹1 production purchase test and verify in Admin Panel.
- [ ] **Task 18.12**: Void test transaction and confirm physical stock reconciliation.
- [ ] **Task 18.13**: Final Go-Live Sign-Off.

---

## EXTERNAL DEPENDENCIES & UNRESOLVED DECISIONS REQUIRING CONFIRMATION

1. **Fastrr Headless SDK & Partial COD Configuration** (`Phase 17`):
   - Fastrr merchant settings configuration for Partial COD advance percentage.
   - Headless Next.js App Router SDK documentation and webhook signature specification *[REQUIRES_FASTRR_PARTNER_DOCS_CONFIRMATION]*.
2. **Shiprocket Webhook Authentication Protocol** (`Phase 15`):
   - Confirmation of static token header (`x-api-key`) with Shiprocket developer docs.
3. **Shiprocket Remittance Reconciliation Specification** (`Phase 15, 16`):
   - Official API endpoint specification or CSV upload schema for automated courier COD remittance advice (CRN / UTR) matching *[REQUIRES_OFFICIAL_DOCS_VERIFICATION]*.
4. **Nutraceutical HSN & GST Confirmation** (`Phase 02, 10`):
   - HSN `2106 90 99` at 18% GST confirmed with Chartered Accountant.
5. **Final Refund & Cancellation Policy** (`Phase 13`):
   - Specific advance forfeiture rules, cancellation deduction rules, and return refund rules will be defined in a later business planning update. Zero legal claims made regarding advance forfeiture.

---

## USER APPROVAL CHECKPOINTS

Before Phase 01 implementation commences, the following items require explicit user approval:
1. **Permanent Firestore Region Selection**: Written approval to deploy Cloud Firestore and Firebase Storage in **`asia-south1` (Mumbai, India)**.
2. **Confirmed Payment Modes**: Approval of the two exclusive modes: **Full Prepaid** and **Partial COD** (with Fastrr-configured advance percentage).
3. **Physical Stock & Pack Multiplier Model**: Confirmation that packs draw from the single physical inventory pool of 200g jars (`GG-DWF-200G`).
4. **Integer Paise Pricing Standard**: Confirmation that all monetary values are stored as integer paise.
5. **Fastrr Isolation Gate**: Confirmation that Fastrr checkout is strictly isolated to Phase 17.
