# GUTGLOW — COMPLETE BACKEND & ADMIN PANEL IMPLEMENTATION MASTER PLAN

**Document Version:** 2.3.0 (Final Pre-Build Architecture Audit & Technical Corrections)  
**Target Environment:** Next.js 16.4.5 (App Router) · React 19.3.0 · Firebase Platform · Tailwind CSS v4  
**Scope:** Complete Backend Infrastructure, Security, Firestore Database, Physical Inventory & Batch Engine, GST & Invoicing, Confirmed Payment Modes (Full Prepaid & Partial COD), Admin Panel, Logistics, and Headless Checkout Architecture  
**Status:** Architecture Specification & Implementation Roadmap (Pre-Execution Review)  

---

## TABLE OF CONTENTS

1. [Executive Summary, Strategic Directives & Revision Change Log](#1-executive-summary-strategic-directives--revision-change-log)
2. [Existing Codebase Inspection Findings](#2-existing-codebase-inspection-findings)
3. [Physical Item, Pack & Inventory Architecture](#3-physical-item-pack--inventory-architecture)
4. [Monetary Standard & GST Calculation Engine](#4-monetary-standard--gst-calculation-engine)
5. [Confirmed Payment Architecture: Full Prepaid & Partial COD](#5-confirmed-payment-architecture-full-prepaid--partial-cod)
6. [Order, Payment, Balance & Shipment Independent State Machines](#6-order-payment-balance--shipment-independent-state-machines)
7. [Security Architecture & Credential Strategy](#7-security-architecture--credential-strategy)
8. [Firebase Infrastructure, Regional Strategy & Environment Gates](#8-firebase-infrastructure-regional-strategy--environment-gates)
9. [Logistics & Checkout Integration Strategy (Shiprocket & Fastrr)](#9-logistics--checkout-integration-strategy-shiprocket--fastrr)
10. [GST Compliance, Tax Invoicing, Returns & Restocking Policies](#10-gst-compliance-tax-invoicing-returns--restocking-policies)
11. [Target Codebase & Directory Structure](#11-target-codebase--directory-structure)
12. [Complete Phase-Wise Development Roadmap (Phases 01 to 18)](#12-complete-phase-wise-development-roadmap)
    - [Phase 01: Firebase Project Creation & Multi-Environment Setup](#phase-01--firebase-project-creation--multi-environment-setup)
    - [Phase 02: Cloud Firestore Architecture & Schema Modeling](#phase-02--cloud-firestore-architecture--schema-modeling)
    - [Phase 03: Firebase Authentication & Admin RBAC Security](#phase-03--firebase-authentication--admin-rbac-security)
    - [Phase 04: Firestore & Storage Security Rules, App Check](#phase-04--firestore--storage-security-rules--app-check)
    - [Phase 05: Product Catalog & Media Pipeline](#phase-05--product-catalog--media-pipeline)
    - [Phase 06: Category Management Backend](#phase-06--category-management-backend)
    - [Phase 07: Safe Transactional Physical Inventory & Batch Engine](#phase-07--safe-transactional-physical-inventory--batch-engine)
    - [Phase 08: Customer Management & Address Book Backend](#phase-08--customer-management--address-book-backend)
    - [Phase 09: Cart & Wishlist Server-Side Synchronization](#phase-09--cart--wishlist-server-side-synchronization)
    - [Phase 10: Order Management Engine & State Machine](#phase-10--order-management-engine--state-machine)
    - [Phase 11: Promotional Engine, Coupons & Pricing Rules](#phase-11--promotional-engine-coupons--pricing-rules)
    - [Phase 12: Customer Reviews & Ratings Aggregator](#phase-12--customer-reviews--ratings-aggregator)
    - [Phase 13: Returns, Replacements & Refunds Engine](#phase-13--returns-replacements--refunds-engine)
    - [Phase 14: Omnichannel Event-Driven Notification System](#phase-14--omnichannel-event-driven-notification-system)
    - [Phase 15: Shiprocket Logistics & Real-Time Tracking Engine](#phase-15--shiprocket-logistics--real-time-tracking-engine)
    - [Phase 16: Complete Custom Admin Panel Development](#phase-16--complete-custom-admin-panel-development)
    - [Phase 17: Fastrr Headless Checkout Integration (Final Checkout Phase)](#phase-17--fastrr-headless-checkout-integration-final-checkout-phase)
    - [Phase 18: Quality Assurance, Security Audit & Production Launch](#phase-18--quality-assurance-security-audit--production-launch)
13. [Cross-Document Consistency Matrix](#13-cross-document-consistency-matrix)
14. [Unresolved Decisions & External Dependencies](#14-unresolved-decisions--external-dependencies)
15. [Decisions Requiring User Approval Before Implementation](#15-decisions-requiring-user-approval-before-implementation)

---

## 1. EXECUTIVE SUMMARY, STRATEGIC DIRECTIVES & REVISION CHANGE LOG

### 1.1 Executive Summary
**GutGlow** is a premium direct-to-consumer (D2C) wellness brand in India. The storefront is developed using Next.js 16 (App Router), React 19, and Tailwind CSS v4.

The initial flagship product is **GutGlow Daily Wellness Formula** (200g net weight single jar, base physical SKU: `GG-DWF-200G`). Customers can purchase 1-Month (1 jar), 2-Month (2 jars), or 3-Month (3 jars) ritual packs. The backend architecture is designed from day zero to support future product expansions, standalone variants, multi-item bundles, and manufacturing batch/lot tracking.

### 1.2 Core Strategic Directives
1. **Zero Storefront Downtime & Design Preservation**: Existing customer-facing routes, visual aesthetics, animations, custom typography (`website-font.otf`), and shopping cart UX remain completely intact.
2. **True Backend Isolation & Zero Trust**: The browser client is treated as completely untrusted. All price calculations, inventory decrements, GST math, and role authorizations execute strictly server-side in Next.js Route Handlers utilizing `firebase-admin` running in Node.js runtime.
3. **Confirmed Payment Modes**: GutGlow offers **exclusively two payment modes**:
   - **Full Prepaid**: 100% online payment through Fastrr Checkout.
   - **Partial COD**: Online percentage advance paid at checkout via Fastrr; remaining balance collected on delivery.
   - **Full COD is strictly NOT offered.**
4. **Decoupled Responsibilities**:
   - **Fastrr Checkout**: Customer checkout UI, Full Prepaid and Partial COD mode configuration, advance percentage calculation, and online advance payment collection.
   - **GutGlow Backend**: Order generation, payment records, advance amount, outstanding balance, payment verification, order status, balance tracking, and remittance reconciliation.
   - **Shiprocket Shipping**: Shipment creation, delivery tracking, courier collection confirmation, and logistics events.
5. **In-Tree Admin Panel**: The custom Admin Panel lives under `/admin` within the existing Next.js App Router, protected by secure HTTP-only cookies (`gutglow_admin_session`, 5-day expiry), Firebase Custom Claims, and server layout guards.
6. **Checkout Staging Isolation**: Fastrr Headless Checkout is strictly isolated to **Phase 17**. All catalog, inventory, order lifecycle, GST invoicing, shipping, and admin capabilities will be fully operational and tested before external checkout connectivity.

### 1.3 Revision Change Log

#### v2.3.0 (Final Pre-Build Architecture Audit & Technical Corrections)

| Section / Topic | v2.2.0 State | v2.3.0 Confirmed Standard | Rationale & Architectural Impact |
| :--- | :--- | :--- | :--- |
| **Phased Firebase Setup** | Phase 01 required creating both `gutglow-development` and `gutglow-production`, plus Vercel production secrets. | **Phase 01 creates ONLY `gutglow-development`** and configures Firebase Local Emulator Suite (`firebase-tools`). Production project creation (`gutglow-production`) and Vercel production secrets are strictly **deferred to Phase 18**. | Adheres to safe phased rollout; eliminates premature production provisioning and credential sprawl during active development. |
| **Firestore Region & Official Pricing** | `asia-south1` noted without verified pricing details. | **Fully researched & verified**: Document reads ($0.06/100k), writes ($0.18/100k), deletes ($0.02/100k), storage ($0.18/GiB/mo), standard egress, Cloud Storage ($0.023/GiB/mo), daily free tiers. Regional comparison with `asia-south2` and multi-region documented with official citations. | Provides total operational cost clarity. Reinforces that database region is permanent and cannot be altered after creation. |
| **Permanent Region Approval Gate** | Region gate existed but lacked explicit blocking language. | **Strict blocking gate**: No Cloud Firestore database or Cloud Storage bucket will be created until explicit user written approval is granted. | Protects project from accidental lock-in to an unapproved cloud geographic location. |
| **Fastrr Checkout Handshake** | Mentioned Fastrr webhook without full initiation lifecycle. | Formulated complete 4-step handshake: 1. Server cart validation (`/api/v1/cart/validate`), 2. Checkout initiation with 15-min stock reservation and Order Reference allocation (`/api/v1/checkout/fastrr/initiate`), 3. Fastrr checkout session, 4. HMAC webhook ingestion (`/api/v1/webhooks/fastrr`) with amount reconciliation. | Eliminates integration ambiguity and guarantees stock integrity across customer checkout journeys. |
| **Sequential vs Sharded Counters** | Sharded counter mentioned without separating uniqueness from sequence. | **Strictly decoupled**: Single-document transactional counter (`counters/orders_YYYYMM`) provides **globally sequential, gapless order numbers** (`GG-2611-000001`). Distributed sharded counters (10 shards) provide high-throughput **mathematical uniqueness** for flash sales (>10-50 ops/sec), but order numbers are sequential only per shard, not globally monotonic. | Resolves architectural contradiction between high-concurrency sharding and strict monotonic sequence requirements. |
| **Courier Balance Remittance Decoupling** | Conflated physical delivery scan with full financial settlement. | `DELIVERED` webhook transitions `shipmentStatus: "delivered"` and `balanceCollectionStatus: "collected"` (courier holds cash). Financial settlement occurs ONLY when courier remittance advice (CRN / UTR) is reconciled in `codRemittances`, updating to `"remitted"` (or `"discrepancy"`). | Accurately accounts for real-world D2C cash flow: courier cash collection at the door does not equal merchant bank balance. |
| **Inventory Reservation & Expired Recovery** | 15-min TTL stated without delayed webhook recovery. | Defined complete reservation state machine: active, committed, expired, released. If a payment webhook arrives after reservation expiration: verifies current stock; if available, re-reserves and confirms order; if exhausted, marks `orderStatus: "stock_exhausted_pending_refund"`, logs alert, and initiates refund. | Prevents silent inventory overselling or untracked orphaned customer payments. |
| **Financial Standard & Unfinalized Policies** | Integer paise standard present; refund policy partially drafted. | Reaffirmed strict integer paise standard (`totalAmountInPaise = advanceAmountInPaise + balanceAmountInPaise`). **Refund and advance-forfeiture policies are formally declared UNFINALIZED.** Zero premature assumptions regarding advance forfeiture or deduction rights. | Keeps financial modeling legally sound and prevents premature claims on non-refundable advances before management sign-off. |

#### v2.2.0 (Confirmed Partial COD & Prepaid Payment Architecture)

| Section / Topic | v2.1.0 State | v2.2.0 Confirmed Model | Rationale & Architectural Impact |
| :--- | :--- | :--- | :--- |
| **Supported Payment Modes** | Included generic/full COD workflows. | **Full COD eliminated.** Supported modes exclusively: **Full Prepaid** and **Partial COD** (Online advance + remaining balance on delivery). | Aligns with confirmed D2C business model to mitigate RTO losses while offering COD convenience. |
| **Advance Percentage Configuration** | Not addressed. | Configured merchant-side in **Fastrr Checkout settings**; NOT hardcoded in GutGlow application. | Avoids duplicate configuration or desynchronization between Fastrr and backend. |
| **Payment Data Model** | Single payment status with COD flags. | Partitioned into: `paymentMode`, `advanceAmountInPaise`, `balanceAmountInPaise`, `advancePaymentStatus`, `balanceCollectionStatus`. | Accurately tracks financial state: advance paid online vs remaining balance due on delivery. |
| **Partial COD Fulfillment Gate** | Order confirmation occurred without advance payment verification. | **Successful online advance payment is strictly mandatory** before an order proceeds to processing/fulfillment. | Protects inventory and warehouse operations from uncommitted orders. |
| **Balance Collection Decoupling** | Conflated courier delivery scan with full payment. | Delivery scan sets `balanceCollectionStatus: "collected"`; actual courier remittance sets `"remitted"`. Order is not marked fully paid upon advance. | Reflects real-world Indian logistics where couriers hold cash and remit periodically. |
| **Refund Policy Status** | Preliminary refund rules noted. | **Refund and cancellation policies are formally marked as NOT finalized.** | Prevents premature business logic or assumptions regarding advance forfeiture or deductions. |

---

## 2. EXISTING CODEBASE INSPECTION FINDINGS

An in-depth static analysis of the repository was conducted prior to drafting this architecture:

### 2.1 Runtime & Framework Specifications
- **Next.js Version**: `16.4.5` (Turbopack bundler enabled, cacheComponents enabled, partialPrefetching enabled).
- **Router Pattern**: App Router (`/app` root with nested route folders).
- **React Version**: `19.3.0` (React 19 Server Components and Client Hooks).
- **TypeScript**: `5.x`, strict mode enabled, path mapping `@/*` mapped to root `./*`.
- **CSS Architecture**: Tailwind CSS v4 (`@tailwindcss/turbopack`), custom `@theme` variables declared in `app/globals.css`.
- **Runtime Restriction**: All backend Route Handlers with `firebase-admin` must declare `export const runtime = 'nodejs'` (not Edge runtime) to ensure compatibility with Node.js crypto and admin credentials.

### 2.2 Installed Package Dependencies
```json
{
  "dependencies": {
    "@hookform/resolvers": "^7.0.3",
    "framer-motion": "^14.10.1",
    "lucide-react": "^1.70.0",
    "next": "16.4.5",
    "react": "19.3.0",
    "react-dom": "19.3.0",
    "react-hook-form": "^7.91.0",
    "zod": "^4.6.7"
  }
}
```

### 2.3 Storefront Route Inventory
| Route Path | Type | Current Implementation State | Backend Integration Target |
| :--- | :--- | :--- | :--- |
| `/` | Server/Client | Editorial layout (Hero, Philosophy, Meet Product, Journal, Footer) | Dynamic product cards, live announcements |
| `/product` | Client Component | Pack selector (1, 2, 3 month), pin check, accordion, buy now | Live pricing in paise, dynamic stock check, live reviews |
| `/cart` | Client Component | Drawer & full page, localStorage cart sync | Server-synced guest & user cart validation |
| `/checkout` | Client Component | Form validation via Zod, mock order generation (`GG-xxxxxx`) | Replaced in Phase 17 by Fastrr flow (Full Prepaid / Partial COD); interim testing harness |
| `/track-order` | Client Component | Mock tracking timeline (`EXP-BLUEDART-984210`) | Connected to secure `POST /api/v1/orders/track` with phone verification |
| `/account` | Client Component | Mock tabbed profile, mock login/register, mock order history | Firebase Auth (Email/Google), real order history |
| `/faq` | Server Component | Static curated Accordion Q&A | Firestore `settings/faq` dynamic fetch |
| `/contact` | Client Component | Form validation via Zod, local state submit | Firestore `inquiries` write + admin alert |

---

## 3. PHYSICAL ITEM, PACK & INVENTORY ARCHITECTURE

### 3.1 Physical Item vs. Pack Commercial Bundles
To prevent phantom inventory, out-of-sync stock pools, and warehouse counting errors:
- **Base Physical Item**: A single 200g jar of GutGlow Daily Wellness Formula.
  - Base SKU: `GG-DWF-200G`
  - Net Weight: 200 grams
- **Commercial Pack Options**:
  - **1-Month Starter Ritual**: `packQuantity = 1` (Contains 1 physical jar of `GG-DWF-200G`).
  - **2-Month Sustained Ritual**: `packQuantity = 2` (Contains 2 physical jars of `GG-DWF-200G`).
  - **3-Month Optimal Ritual**: `packQuantity = 3` (Contains 3 physical jars of `GG-DWF-200G`).

### 3.2 Authoritative Inventory Naming Standard
Across all four documents, interfaces, repositories, and API endpoints, the following field names are mandatory:
- **`quantityAvailable`**: Physical units on hand available for immediate sale.
- **`quantityReserved`**: Physical units held in active, unexpired checkout reservations.
- **`quantityTotal`**: Total physical units on hand (`quantityAvailable + quantityReserved`).

### 3.3 Batch & Lot Tracking Architecture
- Subcollection: `inventory/{sku}/batches/{batchNumber}`:
  - `batchNumber`: string (e.g. `BATCH-GG-2026-01`)
  - `sku`: `GG-DWF-200G`
  - `manufacturingDate`: Timestamp
  - `expiryDate`: Timestamp
  - `mrpInPaise`: number (e.g. `249900` — ₹2,499.00 printed on jar)
  - `quantityInitial`: number
  - `quantityAvailable`: number
  - `quantitySold`: number
  - `quantityQuarantined`: number
  - `quantityDamaged`: number
  - `status`: `"active" | "quarantined" | "expired" | "depleted"`
- **Configurable Shelf-Life Policy**: `settings/store_config.minShelfLifeMonthsAtDispatch` (default: 6 months) governs FEFO dispatch eligibility.

### 3.4 Two-Stage Reservation & Atomic Batch Allocation Lifecycle
1. **Stage 1 (Checkout Hold)**: Holds stock at SKU level (`quantityAvailable -= qty`, `quantityReserved += qty`) with a 15-minute TTL lock.
2. **Stage 2 (Order Confirmation)**: Upon verified online payment (100% for Prepaid, or online advance for Partial COD), an atomic transaction decrements `quantityReserved`, evaluates active batches via FEFO, decrements `batch.quantityAvailable`, and logs batch numbers onto the order.

---

## 4. MONETARY STANDARD & GST CALCULATION ENGINE

### 4.1 Strict Integer Paise Standard
All monetary values across database documents, APIs, and calculations are stored as **integer paise** (INR).
- 1 INR = 100 paise.
- ₹1,499.00 = `149900` paise.
- ₹2,499.00 = `249900` paise.
- Zero floating-point numbers.

### 4.2 D2C Pricing & Legal GST Breakdown Formulas
In Indian e-commerce, consumer-facing prices (MRP) are legally **GST-inclusive**. The storefront displays the final inclusive selling price. On the tax invoice, taxes are extracted backwards:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRICE BREAKDOWN FORMULAS                        │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. Gross Product Total (in Paise):                                      │
│    grossProductAmountInPaise = Σ (item.unitSellingPriceInPaise * qty)   │
│                                                                         │
│ 2. Net Product Payable (after Coupon):                                  │
│    netProductPayableInPaise = grossProductAmountInPaise - discountInPaise│
│                                                                         │
│ 3. Taxable Value Extraction (for 18% GST, rate = 1800 basis points):   │
│    taxableValueInPaise = Math.round(                                    │
│      (netProductPayableInPaise * 10000) / (10000 + gstRateBasisPoints) │
│    )                                                                    │
│                                                                         │
│ 4. Total GST Amount (in Paise):                                         │
│    totalGstAmountInPaise = netProductPayableInPaise - taxableValueInPaise│
│                                                                         │
│ 5. GST Partitioning:                                                    │
│    If Intra-State (e.g. Origin MH -> Destination MH):                   │
│      cgstAmountInPaise = Math.floor(totalGstAmountInPaise / 2)          │
│      sgstAmountInPaise = totalGstAmountInPaise - cgstAmountInPaise      │
│      igstAmountInPaise = 0                                              │
│    If Inter-State (e.g. Origin MH -> Destination KA):                   │
│      cgstAmountInPaise = 0                                              │
│      sgstAmountInPaise = 0                                              │
│      igstAmountInPaise = totalGstAmountInPaise                          │
│                                                                         │
│ 6. Final Total Order Amount:                                            │
│    totalAmountInPaise = netProductPayableInPaise + shippingFeeInPaise   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. CONFIRMED PAYMENT ARCHITECTURE: FULL PREPAID & PARTIAL COD

### 5.1 Confirmed Payment Modes
GutGlow supports **exclusively two payment options**:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   GUTGLOW PAYMENT MODES                                         │
├────────────────────────────────┬────────────────────────────────────────────────────────────────┤
│ MODE                           │ OPERATIONAL DEFINITION                                         │
├────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ 1. Full Prepaid                │ Customer pays 100% of total order value online via Fastrr.    │
│                                │ • advanceAmountInPaise = totalAmountInPaise                    │
│                                │ • balanceAmountInPaise = 0                                     │
│                                │ • balanceCollectionStatus = "not_applicable"                   │
│                                │ • Order moves to fulfillment upon advance verification.        │
├────────────────────────────────┼────────────────────────────────────────────────────────────────┤
│ 2. Partial COD                 │ Customer pays an online percentage advance at checkout.        │
│    (Advance + Balance on Del.) │ Remaining balance collected in cash/UPI by courier at delivery.│
│                                │ • advanceAmountInPaise = Online advance confirmed by Fastrr    │
│                                │ • balanceAmountInPaise = totalAmountInPaise - advanceAmount    │
│                                │ • advancePaymentStatus = "captured" (Required before dispatch) │
│                                │ • balanceCollectionStatus = "pending_delivery"                │
└────────────────────────────────┴────────────────────────────────────────────────────────────────┘
```
> [!IMPORTANT]
> **Full COD is strictly prohibited.** Customers cannot select zero-advance Cash on Delivery.

### 5.2 Checkout Provider Configuration & Separation of Responsibilities
- **Shiprocket Fastrr Checkout**:
  - Manages customer-facing checkout UI and payment option selection.
  - The advance percentage for Partial COD is **configured merchant-side in Fastrr settings**. GutGlow does not hardcode an advance percentage or build a custom calculator.
  - Fastrr collects the online advance and returns verified transaction data.
- **GutGlow Backend**:
  - Ingests verified payment events from Fastrr.
  - Records `paymentMode`, `totalAmountInPaise`, `advanceAmountInPaise`, and `balanceAmountInPaise`.
  - Enforces order status progression based on advance payment verification.
  - Tracks balance collection and reconciles courier remittances.
- **Shiprocket Shipping**:
  - Ingests order details from GutGlow backend, including outstanding `balanceAmountInPaise` as the COD collectible value (`cod_amount = balanceAmountInPaise / 100`).
  - Assigns AWB, generates shipping labels, and broadcasts tracking webhooks.

### 5.3 Complete Checkout & Payment Handshake Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               GUTGLOW CHECKOUT HANDSHAKE SEQUENCE                                │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
  1. CART VALIDATION & SERVER PRICING
     Browser Cart ──> POST /api/v1/cart/validate
     • Server recalculates item totals, active coupon discounts, shipping fee, and GST in paise.
     • Validates physical stock: quantityAvailable >= requested physical units.
     • Returns authoritative line items and pricing breakdown.

  2. CHECKOUT INITIATION & STOCK RESERVATION HOLD
     Browser Initiate ──> POST /api/v1/checkout/fastrr/initiate
     • Server allocates collision-safe Order Reference: GG-YYMM-XXXXXX.
     • Creates 15-minute temporary reservation in `inventoryReservations` subcollection:
       - Increments `quantityReserved` on physical SKU `GG-DWF-200G`.
       - Decrements `quantityAvailable` to prevent overselling during checkout.
     • Calls Fastrr Checkout Session API passing GutGlow order reference and item details.
       *[REQUIRES_FASTRR_PARTNER_DOCS_CONFIRMATION for exact Fastrr Session API request payload]*.
     • Returns Fastrr session token and checkout URL to frontend.

  3. FASTRR CHECKOUT INTERACTION & PAYMENT COLLECTION
     Customer redirected to Fastrr Headless Checkout UI:
     • Customer selects "Full Prepaid" (100% online) OR "Partial COD" (Advance % online).
     • Fastrr calculates advance amount based on merchant dashboard configuration.
     • Customer completes payment via UPI / Netbanking / Cards / Wallets.

  4. WEBHOOK INGESTION & AMOUNT RECONCILIATION
     Fastrr Server ──> POST /api/v1/webhooks/fastrr
     • Webhook signature verified via HMAC-SHA256 (`FASTRR_WEBHOOK_SECRET`).
     • Idempotency check: if `processedWebhooks/fastrr_{eventId}` exists, returns HTTP 200 immediately.
     • Validates financial invariant: `totalAmountInPaise === advanceAmountInPaise + balanceAmountInPaise`.
     • State transition & Batch Commitment:
       - Sets `advancePaymentStatus = "captured"`.
       - Sets `balanceCollectionStatus = paymentMode === "partial_cod" ? "pending_delivery" : "not_applicable"`.
       - Sets `orderStatus = "confirmed"`.
       - Converts temporary reservation to permanent physical deduction:
         - Decrements `quantityReserved` and `quantityTotal` on physical SKU.
         - Allocates physical units to oldest eligible batch via **FEFO** (`inventory/{sku}/batches`).
         - Marks reservation as `committed`.
     • Fires order confirmation notification (Email / SMS) with advance paid and balance due.

  5. WAREHOUSE DISPATCH & SHIPROCKET SHIPMENT CREATION
     Warehouse Dispatch ──> POST /api/v1/admin/orders/[id]/fulfill
     • Creates order on Shiprocket API.
     • Collectible COD amount passed to Shiprocket:
       - For Prepaid: `cod_amount = 0`.
       - For Partial COD: `cod_amount = balanceAmountInPaise / 100`.
     • Shiprocket assigns AWB, courier partner, and schedules pickup.
     • Order transitions to `orderStatus = "processing"`, `shipmentStatus = "manifest_generated"`.

  6. PHYSICAL DELIVERY & COURIER BALANCE COLLECTION
     Courier delivers parcel to customer doorstep:
     • Courier collects remaining cash / UPI balance (`balanceAmountInPaise`).
     • Shiprocket Webhook: `DELIVERED` event ──> POST /api/v1/webhooks/shiprocket
     • Decoupled update:
       - `shipmentStatus = "delivered"`.
       - `balanceCollectionStatus = "collected"`.
       > [!IMPORTANT]
       > Courier has collected the funds; GutGlow's bank account has NOT received remittance.
       > The order is NOT financially settled yet.

  7. COURIER REMITTANCE RECONCILIATION & FINANCIAL SETTLEMENT
     Shiprocket settles collected COD funds periodically (Remittance Cycle):
     • Remittance Advice ingested via CRN / UTR (CSV upload or Webhook).
     • Admin matches settled funds in `codRemittances`:
       - If settled amount matches: `balanceCollectionStatus = "remitted"`, `orderStatus = "completed"`.
       - If shortage or courier deduction: `balanceCollectionStatus = "discrepancy"`, flagged for review.
```

### 5.4 Webhook Idempotency, Concurrency & Delayed Payment Recovery
1. **Duplicate Webhook Protection**: Every webhook request writes its unique `eventId` into `processedWebhooks` within a Firestore transaction. If the ID exists, the handler acknowledges with HTTP 200 without executing state mutations.
2. **Out-of-Order Webhook Protection**: State transition guards reject backward mutations. For example, if an order is already `confirmed`, a delayed `payment.pending` event is discarded.
3. **Delayed Payment Arriving After Reservation Expiration (15-min TTL)**:
   - If customer pays on Fastrr but takes >15 minutes, the background cleaner (`DELETE /api/v1/cron/cleanup-reservations`) will have expired and released the reservation back to `quantityAvailable`.
   - When the delayed successful webhook arrives:
     - The handler re-inspects `inventory/GG-DWF-200G.quantityAvailable`.
     - **If stock is still available**: The handler re-reserves the stock, allocates batches via FEFO, creates the order as `confirmed`, and continues normal fulfillment.
     - **If stock was sold out**: The order is set to `orderStatus: "stock_exhausted_pending_refund"`, `advancePaymentStatus: "captured"`, an urgent admin alert is generated, and a refund transaction is initiated. This guarantees zero inventory overselling under any edge condition.

### 5.5 Order Reference & Sequential vs Sharded Counter Architecture
- **Strict Sequential Order Numbers (`GG-YYMM-XXXXXX`)**:
  - Generated via transactional increment on a single Firestore document `counters/orders_YYYYMM`.
  - Guarantees **gapless, globally sequential order numbers** (e.g. `GG-2611-000001`, `GG-2611-000002`).
  - Capable of sustaining standard D2C traffic (<5-10 orders/second) with exponential backoff retries.
- **Distributed Sharded Counters (Flash Sale Mode)**:
  - If transaction volume exceeds Firestore single-document write limits (>10-50 orders/sec), 10 distributed shards (`counters/orders_YYYYMM/shards/shard_0..9`) are used.
  - **Clarification of Guarantees**: Sharded counters guarantee **mathematical uniqueness** (e.g. `GG-YYMM-S3-000142`), but sequential ordering is per-shard, **NOT globally monotonic across all orders**. Sequentiality and uniqueness are strictly separated in this architecture.

### 5.6 Unfinalized Refund & Advance-Forfeiture Policy Notice
> [!NOTE]
> **Refund and cancellation policies are intentionally UNFINALIZED pending executive approval.**
> This architecture does NOT assume or claim that the customer's online advance payment is non-refundable or legally forfeitable under Indian Consumer Protection rules. All financial data models and state machines include neutral, extensible statuses (`refund_required`, `refund_pending`, `refunded`, `refund_failed`) so that final business and legal rules can be cleanly plugged in without schema refactoring.

---

## 6. ORDER, PAYMENT, BALANCE & SHIPMENT INDEPENDENT STATE MACHINES

### 6.1 Decoupled Quad-Status Architecture
To eliminate state conflicts, every order maintains four logically independent statuses:

```
┌─────────────────────────────────┐   ┌───────────────────────────────┐
│          ORDER STATUS           │   │    ADVANCE PAYMENT STATUS     │
├─────────────────────────────────┤   ├───────────────────────────────┤
│ • pending_payment               │   │ • unpaid                      │
│ • confirmed                     │   │ • captured                    │
│ • processing                    │   │ • failed                      │
│ • completed                     │   │ • refund_required             │
│ • cancelled                     │   │ • refund_pending              │
│ • returned                      │   │ • refunded                    │
│ • partially_returned            │   │ • refund_failed               │
└─────────────────────────────────┘   └───────────────────────────────┘
┌─────────────────────────────────┐   ┌───────────────────────────────┐
│    BALANCE COLLECTION STATUS    │   │        SHIPMENT STATUS         │
├─────────────────────────────────┤   ├───────────────────────────────┤
│ • not_applicable (Prepaid)      │   │ • unfulfilled                  │
│ • pending_delivery              │   │ • manifest_generated           │
│ • collected                     │   │ • pickup_scheduled             │
│ • remitted                      │   │ • in_transit                   │
│ • discrepancy                   │   │ • out_for_delivery             │
│                                 │   │ • delivered                    │
│                                 │   │ • ndr_pending                  │
│                                 │   │ • rto_initiated                │
│                                 │   │ • rto_delivered                │
└─────────────────────────────────┘   └───────────────────────────────┘
```

### 6.2 Key State Transition Rules
1. **Advance Gate**: An order **CANNOT** transition from `pending_payment` to `confirmed` or `processing` unless `advancePaymentStatus === "captured"`.
2. **Partial COD Delivery Rule**: When `shipmentStatus` becomes `delivered`, `balanceCollectionStatus` transitions to `collected`. It does **NOT** transition to `remitted` until bank funds settlement is confirmed.
3. **Completion Rule**:
   - For `prepaid`: `orderStatus` transitions to `completed` upon verified delivery (`shipmentStatus === "delivered"`).
   - For `partial_cod`: `orderStatus` transitions to `completed` only when both `shipmentStatus === "delivered"` and `balanceCollectionStatus === "remitted"`.
4. **RTO Rule**: If delivery is refused, `shipmentStatus = "rto_delivered"` and `orderStatus = "cancelled"`. The outstanding balance remains uncollected. Any refund or forfeiture of the advance follows the future finalized policy.

---

## 7. SECURITY ARCHITECTURE & CREDENTIAL STRATEGY

### 7.1 Two-Tier Credential Architecture
- **Local Development**: Runs strictly on the **Firebase Local Emulator Suite** (ports 8080/9099). Requires zero cloud credentials or private keys.
- **Production (Vercel)**: Environment variables (`FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`) injected securely via Vercel Secret Manager.
- **Google Cloud Runtime (if applicable)**: Uses Application Default Credentials (ADC) / Workload Identity.
- **Strict Prohibition**: Never prefix admin secrets with `NEXT_PUBLIC_`, never import `firebase-admin` client-side, and ensure `.env.local` is gitignored.

### 7.2 Dual-Tier Order Tracking Security
- **Tier 1 (Public Quick Track - Masked Summary)**:
  - Route: `POST /api/v1/orders/track`
  - Input: `{ "orderNumber": "GG-2611-000001", "phoneNumber": "9876543210" }`.
  - Rate limit: 5 requests per 10 minutes per IP. Generic HTTP 404 on failure.
  - Masked output: Customer name `I**** K***`, city `Mu****`, state `MH`, masked balance due. **Zero street address, zero tax invoice download.**
- **Tier 2 (Full Order Access)**:
  - Requires authenticated session (`auth.uid === customer.uid`) or a 24-hour cryptographically signed verification token sent via SMS/Email.

---

## 8. FIREBASE INFRASTRUCTURE, REGIONAL STRATEGY & ENVIRONMENT GATES

### 8.1 Regional Strategy & Verified Cloud Pricing: `asia-south1` (Mumbai, India)
- **Firestore Native Mode Availability**: Fully supported in `asia-south1` (Mumbai) and `asia-south2` (Delhi).
- **Official Firestore Usage-Based Pricing (`asia-south1`)**:
  - **Document Reads**: $0.06 per 100,000 documents.
  - **Document Writes**: $0.18 per 100,000 documents.
  - **Document Deletes**: $0.02 per 100,000 documents.
  - **Database Storage**: $0.18 per GiB per month.
  - **Daily Free Quota (Spark & Blaze tiers)**: 50,000 document reads/day, 20,000 document writes/day, 20,000 document deletes/day, and 1 GiB stored data free every day.
- **Firebase / Cloud Storage Pricing (`asia-south1`)**:
  - **Storage (Standard Regional Class)**: $0.023 per GiB per month.
  - **Class A Operations (Uploads/List)**: $0.05 per 10,000 operations.
  - **Class B Operations (Downloads/Get)**: $0.004 per 10,000 operations.
  - **Co-location Advantage**: Placing Cloud Storage in `asia-south1` alongside Firestore eliminates cross-region data transfer latency and inter-region egress fees.
- **Network Egress Pricing**:
  - Inbound traffic: Free.
  - Intra-region traffic (Cloud Functions / compute within `asia-south1`): Free.
  - Internet egress to clients: First 10 GiB/month free, then standard Google Cloud egress tier ($0.12 per GiB).
- **Regional Comparison Matrix**:
  | Location Option | Type | Round-Trip Latency (India) | Monthly Base Cost | Architectural Assessment |
  | :--- | :--- | :--- | :--- | :--- |
  | **`asia-south1` (Mumbai)** | Regional (Native) | **~15ms – 35ms** | Pay-as-you-go | **Recommended**: Optimal latency for core Indian customer base; full Firebase service parity. |
  | **`asia-south2` (Delhi)** | Regional (Native) | **~25ms – 45ms** | Pay-as-you-go | Valid alternative if Northern India infrastructure co-location is desired. |
  | **`nam5` / `eur3` (US/EU)** | Multi-Region | **~180ms – 260ms** | Higher storage/write rate | Not recommended for Indian D2C: cross-continental latency degrades cart conversion. |
- **PERMANENT LOCATION APPROVAL GATE**:
  > [!CAUTION]
  > **Cloud Firestore database locations are permanent and cannot be changed after creation.**
  > No cloud database will be created until explicit user approval of region `asia-south1` is granted in writing.
- **Official Documentation Sources** (Checked: November 2026):
  - *Firestore Locations*: [https://firebase.google.com/docs/firestore/locations](https://firebase.google.com/docs/firestore/locations)
  - *Cloud Firestore Pricing*: [https://cloud.google.com/firestore/pricing](https://cloud.google.com/firestore/pricing)
  - *Google Cloud Storage Pricing*: [https://cloud.google.com/storage/pricing](https://cloud.google.com/storage/pricing)

### 8.2 Phased Environment Partitioning Strategy
- **Initial Development Strategy (Phases 01 to 17)**:
  - Create **ONLY** the `gutglow-development` Firebase project in Google Cloud / Firebase Console.
  - Run all local feature development and testing on the **Firebase Local Emulator Suite** (`firebase-tools`) on `localhost:8080` (Firestore) and `localhost:9099` (Auth).
  - Connect and verify cloud development services first without prematurely generating production assets.
- **Production Preparation Strategy (Phase 18)**:
  - Create `gutglow-production` project only when the application is validated and ready for production staging.
  - Provision production Firestore, Storage, and configure production secrets (`FIREBASE_ADMIN_*`) in Vercel Secret Manager exclusively during Phase 18.

---

## 9. LOGISTICS & CHECKOUT INTEGRATION STRATEGY (SHIPROCKET & FASTRR)

### 9.1 Shiprocket Logistics Integration & Remittance Architecture
- **Fulfillment & AWB Assignment**: Post-order fulfillment creates shipments via Shiprocket API with `cod_amount` explicitly set to `balanceAmountInPaise / 100` for Partial COD orders (and `0` for Full Prepaid).
- **Decoupled Delivery vs Settlement Lifecycle**:
  1. **Doorstep Delivery**: Courier delivers package. Shiprocket webhook broadcasts `DELIVERED` event.
     - `shipmentStatus` transitions to `"delivered"`.
     - `balanceCollectionStatus` transitions to `"collected"`.
     - *Courier holds physical cash/UPI funds; GutGlow merchant bank account has NOT received remittance.*
  2. **Courier Remittance Reconciliation**:
     - Shiprocket processes courier remittances in 3–7 day financial cycles and issues a Remittance Advice with CRN (Credit Reference Number) and Bank UTR.
     - Ingestion of remittance data via `/api/v1/admin/cod/reconcile` updates matched orders to `balanceCollectionStatus: "remitted"` and `orderStatus: "completed"`.
     - Any short remittance or courier deduction is flagged with `balanceCollectionStatus: "discrepancy"`.
- **Authentication**: Webhook uses static token header (`x-api-key`). *[REQUIRES_OFFICIAL_DOCS_VERIFICATION for exact Shiprocket remittance webhook or report export API]*.

### 9.2 Fastrr Headless Checkout Integration (Strictly Phase 17)
- Manages 1-click checkout, customer address pre-fill, and payment option selection (Prepaid vs Partial COD).
- Advance percentage configuration is set in Fastrr merchant dashboard.
- Integration endpoints marked *[REQUIRES_FASTRR_PARTNER_DOCS_CONFIRMATION]*.

---

## 10. GST COMPLIANCE, TAX INVOICING, RETURNS & RESTOCKING POLICIES

### 10.1 Statutory Tax Invoicing (Rule 46 CGST Rules)
- Generates official Indian Tax Invoices with Seller GSTIN (`27AAAAA0000A1Z5`), sequential invoice number (`GG/26-27/00001`), and HSN `2106 90 99` at 18% GST. *Marked `[REQUIRES_CA_CONFIRMATION]`.*
- Invoices clearly display total order value, advance amount received, and balance due on delivery.

### 10.2 Configurable Company Policies vs Statutory Mandates
- Statutory: Rule 46 CGST, HSN, FSSAI batch expiration.
- Company Policies: `settings/store_config.minShelfLifeMonthsAtDispatch` (default: 6 months), `returnWindowDays` (default: 5 days), `returnPolicyType`.

---

## 11. TARGET CODEBASE & DIRECTORY STRUCTURE

```
Gut Health Business/
├── app/
│   ├── (storefront)/                  # Existing customer-facing routes (PRESERVED)
│   ├── admin/                         # Custom Admin Panel
│   │   ├── layout.tsx                 # Protected admin shell & navigation
│   │   ├── page.tsx                   # Executive KPI dashboard
│   │   ├── login/page.tsx             # Secure admin credential login
│   │   ├── orders/                    # Orders list & detail view
│   │   ├── products/                  # Product catalog & pack matrix
│   │   ├── inventory/                 # Stock levels, batches & adjustments
│   │   ├── customers/                 # Customer directory
│   │   ├── coupons/                   # Promotions manager
│   │   ├── reviews/                   # Moderation queue
│   │   ├── returns/                   # Return & refund inspections
│   │   ├── cod-reconciliation/        # Partial COD balance remittance dashboard
│   │   ├── invoices/                  # Tax Invoices (Rule 46 CGST)
│   │   ├── logs/                      # Immutable audit log viewer
│   │   └── settings/                  # Store, tax & shipping configuration
│   └── api/
│       └── v1/                        # Server Route Handlers (Node.js runtime)
│           ├── health/route.ts        # Safe read-only health check
│           ├── products/              # Storefront catalog endpoints
│           ├── cart/validate/route.ts # Server cart & price validation
│           ├── orders/track/route.ts  # Secure phone-verified tracking
│           ├── auth/                  # Session cookie management
│           ├── admin/                 # RBAC-guarded admin endpoints
│           │   └── cod/reconcile/     # Partial COD balance remittance endpoint
│           └── webhooks/              # Shiprocket & Fastrr receivers
├── lib/
│   ├── firebase/                      # Client & Admin SDK singletons
│   ├── auth/                          # RBAC guards & session verification
│   ├── services/                      # Domain business services
│   │   ├── productService.ts
│   │   ├── inventoryService.ts        # Physical stock & batch transactions
│   │   ├── orderService.ts            # State machine & collision-free ID
│   │   ├── codReconciliationService.ts# Partial COD balance reconciler
│   │   ├── pricingService.ts          # Integer paise & GST calculations
│   │   ├── invoiceService.ts          # Tax invoice generator
│   │   └── auditLogService.ts         # Immutable admin audit logger
│   └── repositories/                  # Firestore data access layer
├── types/
│   └── firestore/                     # Typed Firestore entity models
├── firestore.rules                    # Declarative database security
├── storage.rules                      # Storage bucket access rules
├── firestore.indexes.json             # Composite query indexes
└── scripts/                           # Administrative bootstrap & seed utilities
```

---

## 12. COMPLETE PHASE-WISE DEVELOPMENT ROADMAP

---

### PHASE 01 — Firebase Project Creation & Development Environment Setup
- Establish isolated development Firebase project `gutglow-development` in Google Cloud / Firebase Console.
- *BLOCKING GATE: No cloud database will be created until explicit user written approval of region `asia-south1` is granted.*
- Configure Firebase Local Emulator Suite (`firebase-tools`) for local development (Auth on port 9099, Firestore on port 8080) requiring zero cloud credentials for local coding.
- Implement client and admin SDK singletons with development environment guards.
- Deploy safe read-only smoke-test endpoint (`GET /api/v1/health`) returning `{ status: "healthy", version: "2.3.0" }`.
- *Note: Creation of `gutglow-production` and production Vercel secrets is strictly deferred to Phase 18.*

---

### PHASE 02 — Cloud Firestore Architecture & Schema Modeling
- Deploy complete Firestore schema supporting `paymentMode: "prepaid" | "partial_cod"`.
- Schemas for `advancePaymentStatus`, `balanceCollectionStatus`, `advanceAmountInPaise`, `balanceAmountInPaise`.
- Subcollection `inventory/{sku}/batches` and composite indexes.

---

### PHASE 03 — Firebase Authentication & Admin Security
- Customer auth and admin session cookies (`gutglow_admin_session`, 5-day expiry) with Firebase Custom Claims RBAC.

---

### PHASE 04 — Firebase Security Rules & App Check
- Deny-by-default rules blocking client writes to orders, inventory, and financial balances.

---

### PHASE 05 — Product Catalog & Media Pipeline
- Multi-product catalog, pack options (1x, 2x, 3x in integer paise) linked to base physical SKU `GG-DWF-200G`.

---

### PHASE 06 — Category Management Backend
- Category taxonomy and ordering services.

---

### PHASE 07 — Safe Transactional Physical Inventory & Batch Engine
- Atomic physical stock tracking for `GG-DWF-200G`, two-stage reservation, and FEFO batch allocation.

---

### PHASE 08 — Customer Management & Address Book Backend
- Customer profile and multi-address book with Indian PIN code validation.

---

### PHASE 09 — Cart & Wishlist Server-Side Synchronization
- Server cart validation in integer paise, merging `localStorage` into Firestore upon login.

---

### PHASE 10 — Order Management Engine & State Machine
- Central order engine with collision-safe Order ID generator (`GG-YYMM-XXXXXX`).
- Enforces advance payment requirement before fulfillment for Partial COD.
- Tracks `balanceAmountInPaise` and dual-tier masked order tracking.

---

### PHASE 11 — Promotional Engine, Coupons & Pricing Rules
- Promotional discounts in integer paise with atomic redemption counters.

---

### PHASE 12 — Customer Reviews & Ratings Aggregator
- Review collection with verified buyer checks and atomic rating aggregation.

---

### PHASE 13 — Returns, Replacements & Refunds Engine
- Returns intake with damage photo uploads. Extensible refund ledger (formal refund rules deferred to future planning update).

---

### PHASE 14 — Omnichannel Event-Driven Notification System
- Transactional notifications displaying advance paid and remaining balance due for Partial COD orders.

---

### PHASE 15 — Shiprocket Logistics & Real-Time Tracking Engine
- Pincode serviceability, AWB assignment with collectible amount set to `balanceAmountInPaise`.
- Delivery webhook sets `balanceCollectionStatus: "collected"`.

---

### PHASE 16 — Complete Custom Admin Panel Development
- Administrative dashboard with Partial COD Balance Tracking & Courier Remittance Reconciliation (`/admin/cod-reconciliation`).
- Order management with advance and balance filters.

---

### PHASE 17 — Fastrr Headless Checkout Integration (Final Checkout Phase)
- Integrate Fastrr Headless Checkout with Full Prepaid and Partial COD support.
- Ingests verified advance payment and outstanding balance from Fastrr webhook.
- Advance percentage configured merchant-side in Fastrr settings.

---

### PHASE 18 — Production Infrastructure Provisioning, Security Audit & Launch
- Create isolated production Firebase Project `gutglow-production` in Google Cloud / Firebase Console.
- Provision production Cloud Firestore Native Mode database in approved region (`asia-south1`).
- Provision production Firebase Storage bucket in approved region (`asia-south1`).
- Configure production credentials (`FIREBASE_ADMIN_*`) in Vercel Secret Manager.
- Deploy declarative Firestore Security Rules, Storage Rules, and Composite Indexes to production.
- Execute full end-to-end automated test suites across Full Prepaid and Partial COD user journeys.
- Conduct final security audit and production launch cutover.

---

## 13. CROSS-DOCUMENT CONSISTENCY MATRIX

| Architectural Entity | Implementation Plan | Firestore Schema Plan | API Architecture | Development Checklist |
| :--- | :--- | :--- | :--- | :--- |
| **Supported Payment Modes** | `prepaid`, `partial_cod` (No Full COD) | `prepaid`, `partial_cod` (No Full COD) | `prepaid`, `partial_cod` (No Full COD) | `prepaid`, `partial_cod` (No Full COD) |
| **Advance Payment Status** | `AdvancePaymentStatus` (7 states) | `AdvancePaymentStatus` (7 states) | `AdvancePaymentStatus` (7 states) | `AdvancePaymentStatus` (7 states) |
| **Balance Collection Status**| `BalanceCollectionStatus` (5 states)| `BalanceCollectionStatus` (5 states)| `BalanceCollectionStatus` (5 states)| `BalanceCollectionStatus` (5 states)|
| **Financial Fields** | `totalAmountInPaise`, `advanceAmountInPaise`, `balanceAmountInPaise` | `totalAmountInPaise`, `advanceAmountInPaise`, `balanceAmountInPaise` | `totalAmountInPaise`, `advanceAmountInPaise`, `balanceAmountInPaise` | `totalAmountInPaise`, `advanceAmountInPaise`, `balanceAmountInPaise` |
| **Physical Base SKU** | `GG-DWF-200G` | `GG-DWF-200G` | `GG-DWF-200G` | `GG-DWF-200G` |
| **Stock Field Names** | `quantityAvailable`, `quantityReserved`, `quantityTotal` | `quantityAvailable`, `quantityReserved`, `quantityTotal` | `quantityAvailable`, `quantityReserved`, `quantityTotal` | `quantityAvailable`, `quantityReserved`, `quantityTotal` |
| **Public Order Tracking** | `POST /api/v1/orders/track` (Masked) | Backed by `orders` & `shipments` | `POST /api/v1/orders/track` (Masked) | Task 10.6 & 10.7 |
| **Fastrr Webhook** | `POST /api/v1/webhooks/fastrr` | Writes `orders`, `processedWebhooks` | `POST /api/v1/webhooks/fastrr` | Task 17.5–17.8 |
| **Shiprocket Webhook** | `POST /api/v1/webhooks/shiprocket` | Writes `shipments`, `processedWebhooks` | `POST /api/v1/webhooks/shiprocket` | Task 15.5–15.8 |
| **COD Remittance Matcher** | `POST /api/v1/admin/cod/reconcile` | Writes `codRemittances`, `orders` | `POST /api/v1/admin/cod/reconcile` | Task 16.5 & 16.6 |

---

## 14. UNRESOLVED DECISIONS & EXTERNAL DEPENDENCIES

1. **Fastrr Headless Checkout SDK & Partial COD Configuration** (`Phase 17`):
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

## 15. DECISIONS REQUIRING USER APPROVAL BEFORE IMPLEMENTATION

Before Phase 01 implementation commences, the following items require explicit user approval:
1. **Permanent Firestore Region Selection**: Written approval to deploy Cloud Firestore and Firebase Storage in **`asia-south1` (Mumbai, India)**.
2. **Confirmed Payment Modes**: Approval of the two exclusive modes: **Full Prepaid** and **Partial COD** (with Fastrr-configured advance percentage).
3. **Physical Stock & Pack Multiplier Model**: Confirmation that packs draw from the single physical inventory pool of 200g jars (`GG-DWF-200G`).
4. **Integer Paise Pricing Standard**: Confirmation that all monetary values are stored as integer paise.
5. **Fastrr Isolation Gate**: Confirmation that Fastrr checkout is strictly isolated to Phase 17.
