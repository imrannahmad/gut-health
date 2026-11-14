import type { Timestamp } from './common';

export interface ProductPackOption {
  id: string; // e.g. "pack-1-month", "pack-2-month", "pack-3-month"
  name: string; // "1-Month Supply"
  subtitle: string; // "30 Daily Servings"
  packQuantity: number; // Physical jar multiplier (1, 2, or 3)
  servings: number; // 30, 60, 90
  durationMonths: number; // 1, 2, 3
  totalWeightGrams: number; // 200, 400, 600
  sellingPriceInPaise: number; // e.g. 199900 (₹1,999.00 GST-inclusive)
  mrpInPaise: number; // e.g. 249900 (₹2,499.00)
  compareAtPriceInPaise: number; // e.g. 249900
  badge?: string; // "Standard", "Most Popular", "Best Value"
  isPopular: boolean;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  src: string; // Firebase Storage URL
  alt: string;
  label: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface FirestoreProduct {
  id: string; // Document ID: alphanumeric slug (e.g. "gutglow-daily-wellness")
  slug: string;
  name: string; // "GutGlow Daily Wellness Formula"
  tagline: string; // "Thoughtful gut wellness for everyday living."
  shortDescription: string;
  fullDescription: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  status: 'draft' | 'active' | 'archived';
  isFeatured: boolean;
  servingSize: string; // "1 Scoop (~6.5g) daily with water"
  baseSku: string; // "GG-DWF-200G" (Links to physical inventory)
  netWeightGrams: number; // 200
  hsnCode: string; // "2106 90 99" [REQUIRES_CA_CONFIRMATION]
  gstRateBasisPoints: number; // 1800 (18.00% GST) [REQUIRES_CA_CONFIRMATION]

  // Commercial Pack Options (Integer paise)
  packOptions: ProductPackOption[];

  // Media Gallery (Firebase Storage)
  images: ProductImage[];

  // Formulation & Nutrition
  highlights: string[];
  features: {
    title: string;
    description: string;
  }[];
  specifications: {
    label: string;
    value: string;
  }[];
  ingredientsNote: string;
  provisionalIngredients: {
    category: string;
    items: string[];
    purpose: string;
  }[];
  directions: {
    step: string;
    instruction: string;
  }[];
  safetyInformation: string[];
  storageInstructions: string;

  // Cached Aggregates
  averageRating: number;
  reviewCount: number;
  totalPhysicalJarsSold: number;

  // SEO Metadata
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreCategory {
  id: string; // Document ID: category slug
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  productCount: number; // Cached counter
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
