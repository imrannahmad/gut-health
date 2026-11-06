export interface PackOption {
  id: string;
  name: string;
  subtitle: string;
  servings: number;
  durationMonths: number;
  price: number;
  compareAtPrice?: number;
  badge?: string;
  isPopular?: boolean;
}

export interface ProductDetailItem {
  title: string;
  content: string;
  details?: string[];
}

export interface ProductConfig {
  id: string;
  name: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  servingSize: string;
  defaultPrice: number;
  defaultCompareAtPrice?: number;
  packOptions: PackOption[];
  images: {
    src: string;
    alt: string;
    label: string;
  }[];
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
  shippingInfo: {
    standardDays: string;
    expressDays: string;
    freeShippingThreshold: number;
  };
}

