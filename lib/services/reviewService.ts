import { adminDb } from '@/lib/firebase/admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { reviewRepository, type RatingStats } from '@/lib/repositories/reviewRepository';
import type { FirestoreReview } from '@/types/firestore/store';
import type { FirestoreOrder } from '@/types/firestore/order';
import {
  SubmitReviewInputSchema,
  ModerateReviewInputSchema,
  type SubmitReviewInput,
  type ModerateReviewInput,
  type ListPublicReviewsQuery,
  type ListAdminReviewsQuery,
} from '@/lib/validations/reviewSchema';

/**
 * Mask customer name for privacy (e.g. "Imran Ahmad" -> "Imran A.")
 */
function maskCustomerName(fullName: string): string {
  if (!fullName) return 'Verified Buyer';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

export class ReviewService {
  /**
   * Submit a customer review with strict verified purchase verification
   */
  async submitReview(
    rawInput: unknown,
    userSession?: { uid: string; email?: string; name?: string }
  ): Promise<{ review: FirestoreReview; message: string }> {
    const input = SubmitReviewInputSchema.parse(rawInput);

    // 1. Fetch Order to verify purchase authenticity
    const orderDoc = await adminDb.collection('orders').doc(input.orderId).get();
    if (!orderDoc.exists) {
      throw new Error(
        `Order "${input.orderId}" does not exist. Reviews can only be submitted for verified orders.`
      );
    }

    const order = { id: orderDoc.id, ...orderDoc.data() } as FirestoreOrder;

    // 2. Ownership verification: session UID/email or input customerEmail must match order
    const orderEmail = (order.customer?.email || '').toLowerCase().trim();
    const orderUid = order.customer?.uid;
    const providedEmail = (userSession?.email || input.customerEmail || '').toLowerCase().trim();
    const providedUid = userSession?.uid;

    const isOwnerByUid = Boolean(orderUid && providedUid && orderUid === providedUid);
    const isOwnerByEmail = Boolean(orderEmail && providedEmail && orderEmail === providedEmail);

    if (!isOwnerByUid && !isOwnerByEmail) {
      throw new Error(
        `Verification failed: Customer identity does not match the purchaser on Order "${input.orderId}".`
      );
    }

    // 3. Status validation: Order must not be cancelled
    if (order.orderStatus === 'cancelled') {
      throw new Error(`Reviews cannot be submitted for cancelled orders.`);
    }

    // 4. Product verification in order line items
    const hasPurchasedProduct = order.items?.some((item) => {
      return (
        item.productId === input.productId ||
        item.baseSku === input.productId ||
        (item.baseSku && input.productId.includes(item.baseSku))
      );
    });

    if (!hasPurchasedProduct) {
      throw new Error(
        `Product "${input.productId}" was not found in Order "${input.orderId}". You can only review products you purchased.`
      );
    }

    // 5. Prevent duplicate reviews for the same order and product
    const existing = await reviewRepository.findByOrderAndProduct(input.orderId, input.productId);
    if (existing) {
      throw new Error(
        `A review for product "${input.productId}" has already been submitted from Order "${input.orderId}".`
      );
    }

    // 6. Assemble Review Document
    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const customerOrderName = order.customer
      ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
      : '';
    const customerDisplayName =
      input.customerName || userSession?.name || customerOrderName || 'Verified Buyer';

    const newReview: FirestoreReview = {
      id: reviewId,
      productId: input.productId,
      userId: userSession?.uid || order.customer?.uid || 'guest_buyer',
      customerEmail: orderEmail,
      orderId: input.orderId,
      customerName: customerDisplayName,
      rating: input.rating as 1 | 2 | 3 | 4 | 5,
      title: input.title,
      comment: input.comment,
      isVerifiedBuyer: true,
      status: 'pending', // Editorial moderation queue standard
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await adminDb.collection('reviews').doc(reviewId).set(newReview);

    return {
      review: newReview,
      message:
        'Thank you! Your verified review has been submitted and will appear after moderation.',
    };
  }

  /**
   * Moderate review status (approve or reject) and trigger atomic rating aggregation
   */
  async moderateReview(
    reviewId: string,
    rawInput: unknown,
    adminUser: { uid: string; email?: string }
  ): Promise<{ review: FirestoreReview; ratingStats?: RatingStats }> {
    const input = ModerateReviewInputSchema.parse(rawInput);

    const docRef = adminDb.collection('reviews').doc(reviewId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error(`Review with ID "${reviewId}" does not exist.`);
    }

    const currentReview = { id: docSnap.id, ...docSnap.data() } as FirestoreReview;
    const previousStatus = currentReview.status;
    const newStatus = input.action;

    const updatePayload: Partial<FirestoreReview> = {
      status: newStatus,
      moderatedBy: adminUser.email || adminUser.uid,
      moderatedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    if (input.moderatorNotes !== undefined) {
      updatePayload.moderatorNotes = input.moderatorNotes;
    }

    await docRef.update(updatePayload);

    // If status changed to or from 'approved', recalculate product ratings
    let updatedStats: RatingStats | undefined;
    if (newStatus === 'approved' || previousStatus === 'approved') {
      updatedStats = await this.recalculateProductRatings(currentReview.productId);
    }

    // Record immutable audit log
    await adminDb.collection('adminLogs').add({
      action: `review.${newStatus}`,
      entityType: 'review',
      entityId: reviewId,
      performedBy: adminUser.email || adminUser.uid,
      metadata: {
        productId: currentReview.productId,
        orderId: currentReview.orderId,
        previousStatus,
        newStatus,
        moderatorNotes: input.moderatorNotes || null,
      },
      timestamp: FieldValue.serverTimestamp(),
    });

    const updatedReview: FirestoreReview = {
      ...currentReview,
      ...updatePayload,
    };

    return { review: updatedReview, ratingStats: updatedStats };
  }

  /**
   * Recalculate and atomically update product's averageRating and reviewCount
   */
  async recalculateProductRatings(productId: string): Promise<RatingStats> {
    const stats = await reviewRepository.calculateProductRatingStats(productId);

    // First, try updating product where document ID equals productId
    const directProductRef = adminDb.collection('products').doc(productId);
    const directSnap = await directProductRef.get();

    if (directSnap.exists) {
      await directProductRef.update({
        averageRating: stats.averageRating,
        reviewCount: stats.totalReviews,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return stats;
    }

    // Second, look up product by slug
    const slugSnap = await adminDb
      .collection('products')
      .where('slug', '==', productId)
      .limit(1)
      .get();

    if (!slugSnap.empty) {
      await slugSnap.docs[0].ref.update({
        averageRating: stats.averageRating,
        reviewCount: stats.totalReviews,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return stats;
    }

    return stats;
  }

  /**
   * Public storefront query for approved reviews with rating distribution
   */
  async getPublicReviews(options: {
    productId: string;
    page?: number;
    limit?: number;
    sort?: 'latest' | 'highest' | 'lowest';
  }) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const sort = options.sort || 'latest';

    const [{ items, total }, stats] = await Promise.all([
      reviewRepository.findApprovedReviews(options.productId, { page, limit, sort }),
      reviewRepository.calculateProductRatingStats(options.productId),
    ]);

    const maskedReviews = items.map((r) => ({
      id: r.id,
      productId: r.productId,
      customerName: maskCustomerName(r.customerName),
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isVerifiedBuyer: r.isVerifiedBuyer,
      createdAt: r.createdAt?.toDate ? r.createdAt.toDate().toISOString() : r.createdAt,
    }));

    return {
      stats: {
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
        ratingBreakdown: stats.ratingBreakdown,
      },
      reviews: maskedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * List reviews for admin moderation console
   */
  async listReviewsForAdmin(options: Partial<ListAdminReviewsQuery> = {}) {
    const { items, total } = await reviewRepository.listForAdmin(options);
    const page = options.page || 1;
    const limit = options.limit || 20;

    return {
      reviews: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Fetch a single review by ID
   */
  async getReviewById(id: string): Promise<FirestoreReview | null> {
    return reviewRepository.findById(id);
  }

  /**
   * Delete a review and recalculate aggregates if approved
   */
  async deleteReview(
    reviewId: string,
    adminUser: { uid: string; email?: string }
  ): Promise<{ success: boolean; ratingStats?: RatingStats }> {
    const docRef = adminDb.collection('reviews').doc(reviewId);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new Error(`Review with ID "${reviewId}" does not exist.`);
    }

    const review = snap.data() as FirestoreReview;
    await docRef.delete();

    let updatedStats: RatingStats | undefined;
    if (review.status === 'approved') {
      updatedStats = await this.recalculateProductRatings(review.productId);
    }

    await adminDb.collection('adminLogs').add({
      action: 'review.deleted',
      entityType: 'review',
      entityId: reviewId,
      performedBy: adminUser.email || adminUser.uid,
      metadata: {
        productId: review.productId,
        orderId: review.orderId,
        wasApproved: review.status === 'approved',
      },
      timestamp: FieldValue.serverTimestamp(),
    });

    return { success: true, ratingStats: updatedStats };
  }
}

export const reviewService = new ReviewService();
