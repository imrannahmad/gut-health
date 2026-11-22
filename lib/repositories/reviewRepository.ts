import { BaseRepository } from './baseRepository';
import { adminDb } from '@/lib/firebase/admin';
import type { FirestoreReview } from '@/types/firestore/store';

export interface RatingStats {
  productId: string;
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export class ReviewRepository extends BaseRepository<FirestoreReview> {
  constructor() {
    super('reviews');
  }

  /**
   * Check if a review already exists for an orderId and productId combination
   */
  async findByOrderAndProduct(
    orderId: string,
    productId: string
  ): Promise<FirestoreReview | null> {
    const snap = await this.collection
      .where('orderId', '==', orderId)
      .where('productId', '==', productId)
      .limit(1)
      .get();

    if (snap.empty) {
      return null;
    }

    const doc = snap.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as FirestoreReview;
  }

  /**
   * Find approved reviews for a given product with sorting and pagination
   */
  async findApprovedReviews(
    productId: string,
    options: {
      page?: number;
      limit?: number;
      sort?: 'latest' | 'highest' | 'lowest';
    } = {}
  ): Promise<{ items: FirestoreReview[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const sort = options.sort || 'latest';

    // Query approved reviews for the product
    const snap = await this.collection
      .where('productId', '==', productId)
      .where('status', '==', 'approved')
      .get();

    if (snap.empty) {
      return { items: [], total: 0 };
    }

    let allApproved = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FirestoreReview[];

    // In-memory sorting guarantees zero index contention across diverse sort combinations
    if (sort === 'highest') {
      allApproved.sort((a, b) => b.rating - a.rating || (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    } else if (sort === 'lowest') {
      allApproved.sort((a, b) => a.rating - b.rating || (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    } else {
      allApproved.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    }

    const total = allApproved.length;
    const startIndex = (page - 1) * limit;
    const items = allApproved.slice(startIndex, startIndex + limit);

    return { items, total };
  }

  /**
   * Calculate aggregated rating statistics for a product
   */
  async calculateProductRatingStats(productId: string): Promise<RatingStats> {
    const snap = await this.collection
      .where('productId', '==', productId)
      .where('status', '==', 'approved')
      .get();

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (snap.empty) {
      return {
        productId,
        totalReviews: 0,
        averageRating: 5.0, // Default baseline for luxury brand until verified cohort reviews exist
        ratingBreakdown: breakdown,
      };
    }

    let totalSum = 0;
    const totalCount = snap.docs.length;

    for (const doc of snap.docs) {
      const data = doc.data() as FirestoreReview;
      const rating = (data.rating >= 1 && data.rating <= 5 ? data.rating : 5) as 1 | 2 | 3 | 4 | 5;
      breakdown[rating] = (breakdown[rating] || 0) + 1;
      totalSum += rating;
    }

    const avg = Math.round((totalSum / totalCount) * 10) / 10;

    return {
      productId,
      totalReviews: totalCount,
      averageRating: avg,
      ratingBreakdown: breakdown,
    };
  }

  /**
   * List reviews for admin moderation console with filters
   */
  async listForAdmin(options: {
    productId?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ items: FirestoreReview[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;

    let query: FirebaseFirestore.Query = this.collection;

    if (options.productId) {
      query = query.where('productId', '==', options.productId);
    }

    if (options.status) {
      query = query.where('status', '==', options.status);
    }

    const snap = await query.get();

    if (snap.empty) {
      return { items: [], total: 0 };
    }

    const allItems = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FirestoreReview[];

    // Sort by createdAt desc
    allItems.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

    const total = allItems.length;
    const startIndex = (page - 1) * limit;
    const items = allItems.slice(startIndex, startIndex + limit);

    return { items, total };
  }
}

export const reviewRepository = new ReviewRepository();
