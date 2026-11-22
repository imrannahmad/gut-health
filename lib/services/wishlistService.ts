import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { ProductRepository } from '@/lib/repositories/productRepository';
import { WishlistActionSchema } from '@/lib/validations/cartSchema';
import type { FirestoreWishlistItem } from '@/types/firestore/wishlist';

export class WishlistService {
  private usersCol = adminDb.collection('users');
  private productRepo = new ProductRepository();

  /**
   * List all wishlisted products for an authenticated customer
   */
  async listWishlist(uid: string): Promise<FirestoreWishlistItem[]> {
    const snap = await this.usersCol
      .doc(uid)
      .collection('wishlist')
      .orderBy('addedAt', 'desc')
      .get();

    const items: FirestoreWishlistItem[] = [];

    for (const doc of snap.docs) {
      const data = doc.data();
      const product = await this.productRepo.findById(doc.id);

      items.push({
        productId: doc.id,
        productName: product?.name || data.productName || 'Unknown Product',
        slug: product?.slug || data.slug || '',
        image: product?.images?.[0]?.src || data.image || '/images/gutglow-product-front.jpg',
        basePriceInPaise:
          product?.packOptions?.[0]?.sellingPriceInPaise ||
          data.basePriceInPaise ||
          199900,
        isAvailable: product?.status === 'active',
        addedAt: data.addedAt,
      });
    }

    return items;
  }

  /**
   * Add a product to the customer's wishlist
   */
  async addToWishlist(uid: string, rawInput: unknown): Promise<FirestoreWishlistItem> {
    const validated = WishlistActionSchema.parse(rawInput);
    const product = await this.productRepo.findById(validated.productId);

    if (!product) {
      throw new Error(`Product "${validated.productId}" not found.`);
    }

    const docRef = this.usersCol.doc(uid).collection('wishlist').doc(product.id);
    const basePriceInPaise =
      product.packOptions?.[0]?.sellingPriceInPaise ||
      199900;

    const payload = {
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      image: product.images?.[0]?.src || '/images/gutglow-product-front.jpg',
      basePriceInPaise,
      isAvailable: product.status === 'active',
      addedAt: FieldValue.serverTimestamp(),
    };

    await docRef.set(payload, { merge: true });

    return {
      ...payload,
      addedAt: Timestamp.now() as any,
    };
  }

  /**
   * Remove a product from the customer's wishlist
   */
  async removeFromWishlist(uid: string, productId: string): Promise<void> {
    if (!productId) {
      throw new Error('Product ID is required to remove from wishlist.');
    }
    const docRef = this.usersCol.doc(uid).collection('wishlist').doc(productId);
    await docRef.delete();
  }
}

export const wishlistService = new WishlistService();
