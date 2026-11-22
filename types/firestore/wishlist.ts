import type { Timestamp } from './common';

export interface FirestoreWishlistItem {
  productId: string; // Document ID: productId
  productName: string;
  slug: string;
  image: string;
  basePriceInPaise: number;
  isAvailable: boolean;
  addedAt: Timestamp;
}
