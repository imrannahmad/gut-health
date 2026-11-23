import { BaseRepository, type QueryOptions } from './baseRepository';
import type { FirestoreProduct } from '@/types/firestore/product';

export class ProductRepository extends BaseRepository<FirestoreProduct> {
  constructor() {
    super('products');
  }

  /**
   * Find an active product by its URL-friendly slug
   */
  async findBySlug(slug: string): Promise<FirestoreProduct | null> {
    const snap = await this.collection
      .where('slug', '==', slug)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (snap.empty) {
      return null;
    }

    const doc = snap.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as FirestoreProduct;
  }

  /**
   * List all featured active products for storefront homepage/carousels
   */
  async findFeatured(): Promise<FirestoreProduct[]> {
    try {
      const snap = await this.collection
        .where('status', '==', 'active')
        .where('isFeatured', '==', true)
        .orderBy('createdAt', 'desc')
        .get();

      return snap.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as FirestoreProduct
      );
    } catch (err: any) {
      if (err?.code === 9 || err?.message?.includes('requires an index')) {
        const snap = await this.collection
          .where('status', '==', 'active')
          .where('isFeatured', '==', true)
          .get();
        return snap.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as FirestoreProduct
        );
      }
      throw err;
    }
  }

  /**
   * List all active products within a specific category
   */
  async findByCategory(categoryId: string): Promise<FirestoreProduct[]> {
    try {
      const snap = await this.collection
        .where('status', '==', 'active')
        .where('category.id', '==', categoryId)
        .orderBy('createdAt', 'desc')
        .get();

      return snap.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as FirestoreProduct
      );
    } catch (err: any) {
      if (err?.code === 9 || err?.message?.includes('requires an index')) {
        const snap = await this.collection
          .where('status', '==', 'active')
          .where('category.id', '==', categoryId)
          .get();
        return snap.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as FirestoreProduct
        );
      }
      throw err;
    }
  }

  /**
   * Query all active products with pagination
   */
  async listActive(options: QueryOptions = {}) {
    return this.list({
      ...options,
      where: [...(options.where || []), ['status', '==', 'active']],
    });
  }
}

export const productRepository = new ProductRepository();
