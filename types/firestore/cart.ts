import type { Timestamp } from './common';

export interface FirestoreCartItem {
  productId: string;
  packOptionId: string;
  quantity: number;
  unitPriceInPaise: number;
  subtotalInPaise: number;
  physicalUnitsCount: number; // multiplier * quantity
  productName: string;
  packName: string;
  image: string;
  addedAt: Timestamp;
}

export interface FirestoreCart {
  userId: string; // Document ID: uid
  items: FirestoreCartItem[];
  subtotalInPaise: number;
  shippingFeeInPaise: number;
  taxInPaise: number;
  totalInPaise: number;
  totalPhysicalUnits: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CartValidationSummary {
  subtotalInPaise: number;
  shippingFeeInPaise: number;
  estimatedGstInPaise: number;
  cgstInPaise: number;
  sgstInPaise: number;
  totalInPaise: number;
  totalPhysicalUnits: number;
}

export interface CartValidationResult {
  isValid: boolean;
  isStockAvailable: boolean;
  items: Array<{
    productId: string;
    packOptionId: string;
    productName: string;
    packName: string;
    image: string;
    quantity: number;
    unitPriceInPaise: number;
    subtotalInPaise: number;
    physicalUnits: number;
    isAvailable: boolean;
  }>;
  summary: CartValidationSummary;
  stockStatus: {
    isAvailable: boolean;
    availableStock: number;
    requiredStock: number;
    shortage?: number;
  };
  errors?: string[];
}
