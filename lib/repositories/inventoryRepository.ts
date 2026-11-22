import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, Timestamp, type Transaction } from 'firebase-admin/firestore';
import type {
  FirestoreInventory,
  FirestoreBatch,
  FirestoreInventoryTransaction,
  FirestoreInventoryReservation,
  BatchStatus,
  ReservationStatus,
  InventoryTransactionType,
} from '@/types/firestore/inventory';

export class InventoryRepository {
  private inventoryCol = adminDb.collection('inventory');
  private reservationsCol = adminDb.collection('inventoryReservations');
  private transactionsCol = adminDb.collection('inventoryTransactions');

  /**
   * Get physical SKU inventory document
   */
  async getInventory(sku: string, transaction?: Transaction): Promise<FirestoreInventory | null> {
    const docRef = this.inventoryCol.doc(sku);
    const snap = transaction ? await transaction.get(docRef) : await docRef.get();
    if (!snap.exists) return null;
    return { sku: snap.id, ...snap.data() } as FirestoreInventory;
  }

  /**
   * Update SKU stock levels transactionally or directly
   */
  async updateStockCounts(
    sku: string,
    updates: {
      quantityAvailableDelta?: number;
      quantityReservedDelta?: number;
      quantityTotalDelta?: number;
    },
    transaction?: Transaction
  ): Promise<void> {
    const docRef = this.inventoryCol.doc(sku);
    const data: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (updates.quantityAvailableDelta !== undefined) {
      data.quantityAvailable = FieldValue.increment(updates.quantityAvailableDelta);
    }
    if (updates.quantityReservedDelta !== undefined) {
      data.quantityReserved = FieldValue.increment(updates.quantityReservedDelta);
    }
    if (updates.quantityTotalDelta !== undefined) {
      data.quantityTotal = FieldValue.increment(updates.quantityTotalDelta);
    }

    if (transaction) {
      transaction.update(docRef, data);
    } else {
      await docRef.update(data);
    }
  }

  /**
   * Get all batches for an SKU, optionally filtered by status
   */
  async getBatches(sku: string, status?: BatchStatus, transaction?: Transaction): Promise<FirestoreBatch[]> {
    let query: FirebaseFirestore.Query = this.inventoryCol.doc(sku).collection('batches');
    if (status) {
      query = query.where('status', '==', status);
    }

    const snap = transaction ? await transaction.get(query) : await query.get();
    return snap.docs.map(
      (doc) => ({ ...doc.data(), batchNumber: doc.id } as FirestoreBatch)
    );
  }

  /**
   * Get single batch by batchNumber
   */
  async getBatch(sku: string, batchNumber: string, transaction?: Transaction): Promise<FirestoreBatch | null> {
    const docRef = this.inventoryCol.doc(sku).collection('batches').doc(batchNumber);
    const snap = transaction ? await transaction.get(docRef) : await docRef.get();
    if (!snap.exists) return null;
    return { ...snap.data(), batchNumber: snap.id } as FirestoreBatch;
  }

  /**
   * Update batch quantities and status
   */
  async updateBatch(
    sku: string,
    batchNumber: string,
    data: Partial<FirestoreBatch>,
    transaction?: Transaction
  ): Promise<void> {
    const docRef = this.inventoryCol.doc(sku).collection('batches').doc(batchNumber);
    const updatePayload = {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (transaction) {
      transaction.set(docRef, updatePayload, { merge: true });
    } else {
      await docRef.set(updatePayload, { merge: true });
    }
  }

  /**
   * Record an immutable inventory transaction ledger entry
   */
  async recordTransaction(
    entry: Omit<FirestoreInventoryTransaction, 'id' | 'createdAt'>,
    transaction?: Transaction
  ): Promise<string> {
    const docRef = this.transactionsCol.doc();
    const payload = {
      ...entry,
      createdAt: FieldValue.serverTimestamp(),
    };

    if (transaction) {
      transaction.set(docRef, payload);
    } else {
      await docRef.set(payload);
    }

    return docRef.id;
  }

  /**
   * Create an inventory reservation document
   */
  async createReservation(
    reservation: Omit<FirestoreInventoryReservation, 'createdAt'>,
    transaction?: Transaction
  ): Promise<void> {
    const docRef = this.reservationsCol.doc(reservation.id);
    const payload = {
      ...reservation,
      createdAt: FieldValue.serverTimestamp(),
    };

    if (transaction) {
      transaction.set(docRef, payload);
    } else {
      await docRef.set(payload);
    }
  }

  /**
   * Get an existing reservation by ID
   */
  async getReservation(reservationId: string, transaction?: Transaction): Promise<FirestoreInventoryReservation | null> {
    const docRef = this.reservationsCol.doc(reservationId);
    const snap = transaction ? await transaction.get(docRef) : await docRef.get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() } as FirestoreInventoryReservation;
  }

  /**
   * Update reservation status
   */
  async updateReservationStatus(
    reservationId: string,
    status: ReservationStatus,
    transaction?: Transaction
  ): Promise<void> {
    const docRef = this.reservationsCol.doc(reservationId);
    if (transaction) {
      transaction.update(docRef, { status });
    } else {
      await docRef.update({ status });
    }
  }

  /**
   * Query all active reservations
   */
  async getActiveReservations(sku?: string): Promise<FirestoreInventoryReservation[]> {
    let query: FirebaseFirestore.Query = this.reservationsCol.where('status', '==', 'active');
    if (sku) {
      query = query.where('sku', '==', sku);
    }
    const snap = await query.get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreInventoryReservation));
  }
}

export const inventoryRepository = new InventoryRepository();
