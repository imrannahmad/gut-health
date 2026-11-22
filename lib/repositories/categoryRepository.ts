import { BaseRepository, type QueryOptions } from './baseRepository';
import type { FirestoreCategory } from '@/types/firestore/product';
import { FieldValue } from 'firebase-admin/firestore';

export class CategoryRepository extends BaseRepository<FirestoreCategory> {
  constructor() {
    super('categories');
  }

  /**
   * Find category by slug
   */
  async findBySlug(slug: string): Promise<FirestoreCategory | null> {
    const snap = await this.collection.where('slug', '==', slug).limit(1).get();
    if (snap.empty) {
      return null;
    }
    const doc = snap.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as FirestoreCategory;
  }

  /**
   * List all active categories sorted by displayOrder
   */
  async listActive(): Promise<FirestoreCategory[]> {
    const snap = await this.collection
      .where('isActive', '==', true)
      .get();

    return snap.docs
      .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as FirestoreCategory
      )
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  /**
   * List all categories for admin (including inactive) sorted by displayOrder
   */
  async listAll(): Promise<FirestoreCategory[]> {
    const snap = await this.collection.get();

    return snap.docs
      .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as FirestoreCategory
      )
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  /**
   * Increment or decrement cached productCount
   */
  async updateProductCount(categoryId: string, delta: number): Promise<void> {
    const docRef = this.collection.doc(categoryId);
    await docRef.update({
      productCount: FieldValue.increment(delta),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

export const categoryRepository = new CategoryRepository();
