import { adminDb } from '@/lib/firebase/admin';
import { inventoryRepository } from '@/lib/repositories/inventoryRepository';
import type { FirestoreBatch } from '@/types/firestore/inventory';

export interface BatchAllocationItem {
  batchNumber: string;
  quantity: number;
  manufacturingDate: Date;
  expiryDate: Date;
  mrpInPaise: number;
}

export interface BatchAllocationResult {
  sku: string;
  totalAllocated: number;
  allocations: BatchAllocationItem[];
}

export class BatchAllocationService {
  /**
   * Fetches minimum allowable shelf life months at dispatch from store_config
   */
  async getMinShelfLifeMonths(): Promise<number> {
    try {
      const snap = await adminDb.collection('settings').doc('store_config').get();
      if (snap.exists) {
        return Number(snap.data()?.minShelfLifeMonthsAtDispatch) || 6;
      }
    } catch (err) {
      console.warn('[BatchAllocation] Notice reading store_config:', err);
    }
    return 6; // Standard 6-month minimum shelf-life policy
  }

  /**
   * Allocates physical units using FEFO (First Expired, First Out) rules.
   * Guarantees customers only receive batches with >= minShelfLifeMonths remaining.
   */
  async allocateBatchesForOrder(
    sku: string,
    requestedQuantity: number,
    transaction?: FirebaseFirestore.Transaction
  ): Promise<BatchAllocationResult> {
    if (requestedQuantity <= 0) {
      throw new Error('Requested quantity for batch allocation must be at least 1.');
    }

    const minShelfLifeMonths = await this.getMinShelfLifeMonths();
    const minExpiryDate = new Date();
    minExpiryDate.setMonth(minExpiryDate.getMonth() + minShelfLifeMonths);
    const minExpiryMs = minExpiryDate.getTime();

    const execute = async (t: FirebaseFirestore.Transaction) => {
      // 1. Fetch all active batches for the SKU
      const batches = await inventoryRepository.getBatches(sku, 'active', t);

      // 2. Filter batches that satisfy shelf life criteria
      const eligibleBatches = batches.filter((b) => {
        const expiryMs = b.expiryDate?.toMillis?.() || 0;
        return expiryMs >= minExpiryMs && b.quantityAvailable > 0;
      });

      if (eligibleBatches.length === 0) {
        throw new Error(
          `No active batches with at least ${minShelfLifeMonths} months shelf life remaining for SKU ${sku}.`
        );
      }

      // 3. Sort ascending by expiryDate (FEFO: Earliest expiry dispatched first)
      eligibleBatches.sort((a, b) => {
        const expA = a.expiryDate?.toMillis?.() || 0;
        const expB = b.expiryDate?.toMillis?.() || 0;
        return expA - expB;
      });

      // 4. Allocate units greedily across sorted batches
      let remainingToAllocate = requestedQuantity;
      const allocations: BatchAllocationItem[] = [];

      for (const batch of eligibleBatches) {
        if (remainingToAllocate <= 0) break;

        const takeFromThisBatch = Math.min(batch.quantityAvailable, remainingToAllocate);
        const newAvailable = batch.quantityAvailable - takeFromThisBatch;
        const newSold = (batch.quantitySold || 0) + takeFromThisBatch;

        allocations.push({
          batchNumber: batch.batchNumber,
          quantity: takeFromThisBatch,
          manufacturingDate: batch.manufacturingDate?.toDate?.() || new Date(),
          expiryDate: batch.expiryDate?.toDate?.() || new Date(),
          mrpInPaise: batch.mrpInPaise || 249900,
        });

        // Update batch record
        await inventoryRepository.updateBatch(
          sku,
          batch.batchNumber,
          {
            quantityAvailable: newAvailable,
            quantitySold: newSold,
            status: newAvailable === 0 ? 'depleted' : 'active',
          },
          t
        );

        remainingToAllocate -= takeFromThisBatch;
      }

      if (remainingToAllocate > 0) {
        throw new Error(
          `Insufficient batch units available for SKU ${sku}. Needed ${requestedQuantity}, allocated ${requestedQuantity - remainingToAllocate}.`
        );
      }

      // Decrement main SKU inventory count directly upon order confirmation (standard D2C)
      await inventoryRepository.updateStockCounts(
        sku,
        {
          quantityAvailableDelta: -requestedQuantity,
          quantityTotalDelta: -requestedQuantity,
        },
        t
      );

      return {
        sku,
        totalAllocated: requestedQuantity,
        allocations,
      };
    };

    if (transaction) {
      return await execute(transaction);
    } else {
      return await adminDb.runTransaction(execute);
    }
  }
}

export const batchAllocationService = new BatchAllocationService();
