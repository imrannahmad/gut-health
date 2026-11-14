import type { Timestamp } from './common';

export interface FirestoreInventory {
  sku: string; // Document ID: "GG-DWF-200G" (Physical base SKU)
  name: string; // "GutGlow Daily Wellness Formula (200g Jar)"
  productId: string; // "gutglow-daily-wellness"
  netWeightGrams: number; // 200

  // Authoritative Stock Naming Standard
  quantityAvailable: number; // Physical jars available for immediate sale
  quantityReserved: number; // Physical jars held in active 15-minute checkout sessions
  quantityTotal: number; // quantityAvailable + quantityReserved
  lowStockThreshold: number; // e.g. 100 jars
  isLowStock: boolean;

  // Inventory Controls
  trackInventory: boolean;
  allowBackorders: boolean;
  batchTracking: boolean; // true
  activeBatchCount: number;

  updatedAt: Timestamp;
}

export type BatchStatus = 'active' | 'quarantined' | 'expired' | 'depleted';

export interface FirestoreBatch {
  batchNumber: string; // Document ID: e.g. "BATCH-GG-2026-01"
  sku: string; // "GG-DWF-200G"
  manufacturingDate: Timestamp;
  expiryDate: Timestamp;
  mrpInPaise: number; // 249900 (₹2,499.00 printed on physical jar)

  // Authoritative Batch Quantities
  quantityInitial: number; // Received physical units (e.g. 2500)
  quantityAvailable: number; // Sellable units remaining in this batch
  quantitySold: number; // Units fulfilled in orders
  quantityQuarantined: number; // Units held for quality inspection
  quantityDamaged: number; // Units written off to loss

  status: BatchStatus;
  labReportPdfUrl?: string; // FSSAI test certificate in Firebase Storage
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type InventoryTransactionType =
  | 'reservation'
  | 'purchase'
  | 'cancellation'
  | 'restock'
  | 'manual_adjustment'
  | 'loss_damaged';

export interface FirestoreInventoryTransaction {
  id: string; // Auto-generated ID
  sku: string; // "GG-DWF-200G"
  batchNumber?: string;
  type: InventoryTransactionType;
  delta: number; // Negative for sale/reservation (-3), positive for restock (+500)
  previousStock: number;
  newStock: number;
  referenceType: 'order' | 'return' | 'admin_adjustment' | 'restock_po';
  referenceId: string; // e.g. Order number "GG-2611-000001"
  notes?: string;
  operatorId: string; // Admin UID or "SYSTEM"
  createdAt: Timestamp;
}

export type ReservationStatus = 'active' | 'committed' | 'expired' | 'released';

export interface FirestoreInventoryReservation {
  id: string; // Document ID: e.g. "res_01HZX..."
  orderNumber: string; // e.g. "GG-2611-000001"
  sku: string; // "GG-DWF-200G"
  requestedPhysicalJars: number; // Number of physical 200g jars held
  sessionToken: string; // Associated Fastrr checkout session ID
  status: ReservationStatus;
  expiresAt: Timestamp; // Current time + 15 minutes TTL
  createdAt: Timestamp;
}
