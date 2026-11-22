import { adminDb } from '@/lib/firebase/admin';
import { inventoryRepository } from '@/lib/repositories/inventoryRepository';
import { Timestamp } from 'firebase-admin/firestore';
import crypto from 'crypto';

export interface ReserveStockParams {
  sku: string; // e.g. "GG-DWF-200G"
  physicalJars: number; // e.g. 1, 2, or 3 jars
  sessionToken: string; // Fastrr or browser checkout session identifier
  orderNumber?: string;
  ttlMinutes?: number; // Default 15 minutes
}

export interface ReservationResult {
  reservationId: string;
  sku: string;
  requestedPhysicalJars: number;
  expiresAt: Date;
  status: 'active';
}

export class InventoryReservationService {
  private defaultTtlMs = 15 * 60 * 1000; // 15 Minutes

  /**
   * Transactionally reserve physical stock for a checkout session.
   * Prevents overselling by atomically holding jars in quantityReserved.
   */
  async reserveStock(params: ReserveStockParams): Promise<ReservationResult> {
    const { sku, physicalJars, sessionToken, orderNumber } = params;

    if (physicalJars <= 0) {
      throw new Error('Physical jars count must be at least 1.');
    }

    const ttlMs = (params.ttlMinutes || 15) * 60 * 1000;
    const expiresAtDate = new Date(Date.now() + ttlMs);
    const expiresAtTimestamp = Timestamp.fromDate(expiresAtDate);
    const reservationId = `res_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    return await adminDb.runTransaction(async (transaction) => {
      // 1. Read authoritative inventory
      const inventory = await inventoryRepository.getInventory(sku, transaction);
      if (!inventory) {
        throw new Error(`Inventory record for SKU "${sku}" does not exist.`);
      }

      if (inventory.quantityAvailable < physicalJars) {
        throw new Error(
          `Insufficient stock available for SKU ${sku}. Requested: ${physicalJars}, Available: ${inventory.quantityAvailable}`
        );
      }

      // 2. Adjust stock levels (Deduct from Available, Add to Reserved)
      await inventoryRepository.updateStockCounts(
        sku,
        {
          quantityAvailableDelta: -physicalJars,
          quantityReservedDelta: physicalJars,
        },
        transaction
      );

      // 3. Write Reservation document
      await inventoryRepository.createReservation(
        {
          id: reservationId,
          sku,
          orderNumber: orderNumber || `PENDING-${reservationId.slice(-6).toUpperCase()}`,
          requestedPhysicalJars: physicalJars,
          sessionToken,
          status: 'active',
          expiresAt: expiresAtTimestamp,
        },
        transaction
      );

      // 4. Log to Immutable Transaction Ledger
      await inventoryRepository.recordTransaction(
        {
          sku,
          type: 'reservation',
          delta: -physicalJars,
          previousStock: inventory.quantityAvailable,
          newStock: inventory.quantityAvailable - physicalJars,
          referenceType: 'order',
          referenceId: reservationId,
          notes: `15-minute checkout reservation for session ${sessionToken.slice(0, 8)}...`,
          operatorId: 'SYSTEM',
        },
        transaction
      );

      return {
        reservationId,
        sku,
        requestedPhysicalJars: physicalJars,
        expiresAt: expiresAtDate,
        status: 'active',
      };
    });
  }

  /**
   * Release an active reservation back to available inventory
   * (e.g. customer abandons cart or payment times out)
   */
  async releaseReservation(reservationId: string, reason: string = 'session_abandoned'): Promise<boolean> {
    return await adminDb.runTransaction(async (transaction) => {
      const reservation = await inventoryRepository.getReservation(reservationId, transaction);
      if (!reservation) {
        return false;
      }

      // Only active reservations can be released
      if (reservation.status !== 'active') {
        return false;
      }

      const { sku, requestedPhysicalJars } = reservation;
      const inventory = await inventoryRepository.getInventory(sku, transaction);
      const previousAvailable = inventory?.quantityAvailable || 0;

      // 1. Update reservation status
      await inventoryRepository.updateReservationStatus(reservationId, 'released', transaction);

      // 2. Restore Available stock, Decrement Reserved
      await inventoryRepository.updateStockCounts(
        sku,
        {
          quantityAvailableDelta: requestedPhysicalJars,
          quantityReservedDelta: -requestedPhysicalJars,
        },
        transaction
      );

      // 3. Log recovery to Transaction Ledger
      await inventoryRepository.recordTransaction(
        {
          sku,
          type: 'cancellation',
          delta: requestedPhysicalJars,
          previousStock: previousAvailable,
          newStock: previousAvailable + requestedPhysicalJars,
          referenceType: 'order',
          referenceId: reservationId,
          notes: `Reservation released (${reason}). Returned ${requestedPhysicalJars} units to available stock.`,
          operatorId: 'SYSTEM',
        },
        transaction
      );

      return true;
    });
  }

  /**
   * Commit a reservation upon verified payment capture.
   * Converts the hold into a completed purchase deduction.
   */
  async commitReservation(
    reservationId: string,
    finalOrderNumber: string,
    parentTransaction?: FirebaseFirestore.Transaction
  ): Promise<void> {
    const execute = async (transaction: FirebaseFirestore.Transaction) => {
      const reservation = await inventoryRepository.getReservation(reservationId, transaction);
      if (!reservation) {
        throw new Error(`Reservation "${reservationId}" not found for commit.`);
      }

      if (reservation.status === 'committed') {
        // Already committed (idempotency guard)
        return;
      }

      if (reservation.status !== 'active') {
        throw new Error(
          `Cannot commit reservation "${reservationId}" in status "${reservation.status}".`
        );
      }

      const { sku, requestedPhysicalJars } = reservation;
      const inventory = await inventoryRepository.getInventory(sku, transaction);
      const previousTotal = inventory?.quantityTotal || 0;

      // 1. Mark reservation committed
      await inventoryRepository.updateReservationStatus(reservationId, 'committed', transaction);

      // 2. Deduct from Reserved and Total (Permanent sale)
      await inventoryRepository.updateStockCounts(
        sku,
        {
          quantityReservedDelta: -requestedPhysicalJars,
          quantityTotalDelta: -requestedPhysicalJars,
        },
        transaction
      );

      // 3. Log purchase to Transaction Ledger
      await inventoryRepository.recordTransaction(
        {
          sku,
          type: 'purchase',
          delta: -requestedPhysicalJars,
          previousStock: previousTotal,
          newStock: previousTotal - requestedPhysicalJars,
          referenceType: 'order',
          referenceId: finalOrderNumber,
          notes: `Committed sale for Order ${finalOrderNumber}`,
          operatorId: 'SYSTEM',
        },
        transaction
      );
    };

    if (parentTransaction) {
      await execute(parentTransaction);
    } else {
      await adminDb.runTransaction(execute);
    }
  }

  /**
   * Cleanup task: scans active reservations that have exceeded their 15-minute TTL
   * and automatically releases them back to inventory.
   */
  async cleanupExpiredReservations(): Promise<{ releasedCount: number }> {
    const activeReservations = await inventoryRepository.getActiveReservations();
    const now = Date.now();
    let releasedCount = 0;

    for (const res of activeReservations) {
      const expiresAtMs = res.expiresAt?.toMillis?.() || 0;
      if (expiresAtMs > 0 && expiresAtMs < now) {
        try {
          const success = await this.releaseReservation(res.id, 'ttl_expired');
          if (success) releasedCount++;
        } catch (err) {
          console.warn(`[Reservation Cleanup] Failed to release ${res.id}:`, err);
        }
      }
    }

    return { releasedCount };
  }
}

export const inventoryReservationService = new InventoryReservationService();
