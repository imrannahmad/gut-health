import { adminDb } from '@/lib/firebase/admin';
import { inventoryRepository } from '@/lib/repositories/inventoryRepository';
import { FieldValue } from 'firebase-admin/firestore';

export interface ReconciliationReport {
  sku: string;
  isHealthy: boolean;
  checkedAt: Date;
  metrics: {
    inventoryAvailable: number;
    inventoryReserved: number;
    inventoryTotal: number;
    batchAvailableTotal: number;
    activeReservationsTotal: number;
  };
  discrepancies: {
    batchVsTotalDiff: number; // batchAvailableTotal - inventoryTotal
    reservationDiff: number; // inventoryReserved - activeReservationsTotal
  };
  status: 'HEALTHY' | 'DRIFT_DETECTED';
  message: string;
}

export class InventoryReconciliationService {
  /**
   * Run an audit check on physical SKU stock vs batch totals vs active reservations
   */
  async reconcileSku(sku: string = 'GG-DWF-200G'): Promise<ReconciliationReport> {
    const inventory = await inventoryRepository.getInventory(sku);
    if (!inventory) {
      throw new Error(`Inventory for SKU "${sku}" does not exist.`);
    }

    // 1. Sum up physical stock in all active batches
    const batches = await inventoryRepository.getBatches(sku);
    const activeBatches = batches.filter((b) => b.status === 'active');
    const batchAvailableTotal = activeBatches.reduce((acc, b) => acc + (b.quantityAvailable || 0), 0);

    // 2. Sum up physical stock in all active reservation documents
    const activeReservations = await inventoryRepository.getActiveReservations(sku);
    const activeReservationsTotal = activeReservations.reduce(
      (acc, r) => acc + (r.requestedPhysicalJars || 0),
      0
    );

    const invAvailable = inventory.quantityAvailable || 0;
    const invReserved = inventory.quantityReserved || 0;
    const invTotal = inventory.quantityTotal || 0;

    const batchVsTotalDiff = batchAvailableTotal - invTotal;
    const reservationDiff = invReserved - activeReservationsTotal;

    const isHealthy = batchVsTotalDiff === 0 && reservationDiff === 0 && invTotal === (invAvailable + invReserved);

    return {
      sku,
      isHealthy,
      checkedAt: new Date(),
      metrics: {
        inventoryAvailable: invAvailable,
        inventoryReserved: invReserved,
        inventoryTotal: invTotal,
        batchAvailableTotal,
        activeReservationsTotal,
      },
      discrepancies: {
        batchVsTotalDiff,
        reservationDiff,
      },
      status: isHealthy ? 'HEALTHY' : 'DRIFT_DETECTED',
      message: isHealthy
        ? `Inventory for SKU ${sku} is 100% synchronized and mathematically consistent.`
        : `Discrepancy detected in SKU ${sku}: Batches Total (${batchAvailableTotal}) does not match Inventory Total (${invTotal}).`,
    };
  }

  /**
   * Corrects and synchronizes inventory document values to match physical batch truth
   */
  async repairInventoryDrift(sku: string = 'GG-DWF-200G', adminId: string = 'SYSTEM'): Promise<ReconciliationReport> {
    return await adminDb.runTransaction(async (transaction) => {
      const inventory = await inventoryRepository.getInventory(sku, transaction);
      if (!inventory) throw new Error(`SKU ${sku} not found`);

      const batches = await inventoryRepository.getBatches(sku, undefined, transaction);
      const activeBatches = batches.filter((b) => b.status === 'active');
      const batchAvailableTotal = activeBatches.reduce((acc, b) => acc + (b.quantityAvailable || 0), 0);

      const activeReservations = await inventoryRepository.getActiveReservations(sku);
      const activeReservationsTotal = activeReservations.reduce(
        (acc, r) => acc + (r.requestedPhysicalJars || 0),
        0
      );

      const correctedReserved = activeReservationsTotal;
      const correctedAvailable = Math.max(0, batchAvailableTotal - correctedReserved);
      const correctedTotal = correctedAvailable + correctedReserved;

      // Update inventory record
      const invRef = adminDb.collection('inventory').doc(sku);
      transaction.update(invRef, {
        quantityAvailable: correctedAvailable,
        quantityReserved: correctedReserved,
        quantityTotal: correctedTotal,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Log repair action
      await inventoryRepository.recordTransaction(
        {
          sku,
          type: 'manual_adjustment',
          delta: correctedTotal - (inventory.quantityTotal || 0),
          previousStock: inventory.quantityTotal || 0,
          newStock: correctedTotal,
          referenceType: 'admin_adjustment',
          referenceId: `REPAIR-${Date.now()}`,
          notes: `Automatic reconciliation repair: synced total with physical batches (${batchAvailableTotal}) and reservations (${correctedReserved}).`,
          operatorId: adminId,
        },
        transaction
      );

      return {
        sku,
        isHealthy: true,
        checkedAt: new Date(),
        metrics: {
          inventoryAvailable: correctedAvailable,
          inventoryReserved: correctedReserved,
          inventoryTotal: correctedTotal,
          batchAvailableTotal,
          activeReservationsTotal: correctedReserved,
        },
        discrepancies: {
          batchVsTotalDiff: 0,
          reservationDiff: 0,
        },
        status: 'HEALTHY',
        message: `Inventory drift repaired. Re-synchronized to ${correctedTotal} total physical units.`,
      };
    });
  }
}

export const inventoryReconciliationService = new InventoryReconciliationService();
