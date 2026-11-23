import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, type WhereFilterOp, type Transaction } from 'firebase-admin/firestore';
import type { BaseFirestoreDocument } from '@/types/firestore/common';

export interface QueryOptions {
  where?: Array<[string, WhereFilterOp, unknown]>;
  orderBy?: [string, 'asc' | 'desc'];
  limit?: number;
  startAfterDocId?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export abstract class BaseRepository<T extends BaseFirestoreDocument> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected get collection() {
    return adminDb.collection(this.collectionName);
  }

  /**
   * Find a document by its unique ID
   */
  async findById(id: string): Promise<T | null> {
    const docSnap = await this.collection.doc(id).get();
    if (!docSnap.exists) {
      return null;
    }
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as T;
  }

  /**
   * Create a new document with an explicit or auto-generated ID
   */
  async create(id: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const docRef = this.collection.doc(id);
    const now = FieldValue.serverTimestamp();
    const documentData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await docRef.set(documentData);

    return {
      id,
      ...documentData,
    } as unknown as T;
  }

  /**
   * Update an existing document partially
   */
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = this.collection.doc(id);
    await docRef.update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  /**
   * Delete a document by ID
   */
  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  /**
   * Query documents with filters, sorting, and cursor-based pagination
   */
  async list(options: QueryOptions = {}): Promise<PaginatedResult<T>> {
    let query: FirebaseFirestore.Query = this.collection;

    // Apply WHERE clauses
    if (options.where && options.where.length > 0) {
      for (const [field, op, val] of options.where) {
        query = query.where(field, op, val);
      }
    }

    // Apply ORDER BY
    if (options.orderBy) {
      const [field, direction] = options.orderBy;
      query = query.orderBy(field, direction);
    } else {
      query = query.orderBy('createdAt', 'desc');
    }

    // Apply cursor pagination
    if (options.startAfterDocId) {
      const startDoc = await this.collection.doc(options.startAfterDocId).get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    const limitCount = options.limit || 20;
    query = query.limit(limitCount);

    let snapshot: FirebaseFirestore.QuerySnapshot;
    try {
      snapshot = await query.get();
    } catch (err: any) {
      // Graceful fallback if Firestore composite index is missing or building
      if (err?.code === 9 || err?.message?.includes('requires an index')) {
        let fallbackQuery: FirebaseFirestore.Query = this.collection;
        if (options.where && options.where.length > 0) {
          for (const [field, op, val] of options.where) {
            fallbackQuery = fallbackQuery.where(field, op, val);
          }
        }
        const fallbackSnap = await fallbackQuery.get();
        let fallbackItems = fallbackSnap.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as unknown as T
        );

        // In-memory sorting
        const sortField = options.orderBy ? options.orderBy[0] : 'createdAt';
        const sortDir = options.orderBy ? options.orderBy[1] : 'desc';
        fallbackItems.sort((a: any, b: any) => {
          const valA = a[sortField]?.toMillis ? a[sortField].toMillis() : (a[sortField] || 0);
          const valB = b[sortField]?.toMillis ? b[sortField].toMillis() : (b[sortField] || 0);
          return sortDir === 'desc' ? (valB > valA ? 1 : -1) : (valA > valB ? 1 : -1);
        });

        const pagedItems = fallbackItems.slice(0, limitCount);
        const nextCursor =
          fallbackItems.length > limitCount
            ? (fallbackItems[limitCount - 1] as any)?.id || null
            : null;

        return {
          items: pagedItems,
          nextCursor,
          hasMore: Boolean(nextCursor),
        };
      }
      throw err;
    }

    const items = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as T
    );

    const nextCursor =
      snapshot.docs.length === limitCount
        ? snapshot.docs[snapshot.docs.length - 1].id
        : null;

    return {
      items,
      nextCursor,
      hasMore: Boolean(nextCursor),
    };
  }

  /**
   * Run an atomic transaction across documents
   */
  async runTransaction<R>(
    updateFunction: (transaction: Transaction) => Promise<R>
  ): Promise<R> {
    return adminDb.runTransaction(updateFunction);
  }
}
