import { z } from 'zod';

export const ProductPackOptionSchema = z.object({
  id: z.string().min(1, 'Pack option ID is required'),
  name: z.string().min(1, 'Pack option name is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  packQuantity: z
    .number()
    .int('Pack quantity must be an integer')
    .min(1, 'Must contain at least 1 unit'),
  servings: z.number().int().min(1, 'Servings must be at least 1'),
  durationMonths: z.number().int().min(1, 'Duration must be at least 1 month'),
  totalWeightGrams: z.number().int().min(1, 'Total weight must be positive'),
  sellingPriceInPaise: z
    .number()
    .int('Selling price must be an integer in paise')
    .min(100, 'Price must be at least 100 paise (₹1.00)'),
  mrpInPaise: z
    .number()
    .int('MRP must be an integer in paise')
    .min(100, 'MRP must be at least 100 paise (₹1.00)'),
  compareAtPriceInPaise: z
    .number()
    .int('Compare at price must be an integer in paise')
    .min(100, 'Compare price must be at least 100 paise'),
  badge: z.string().optional(),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const ProductImageSchema = z.object({
  id: z.string().min(1),
  src: z.string().min(1, 'Image URL/Path is required'),
  alt: z.string().min(1, 'Alt text is required'),
  label: z.string().min(1, 'Label is required'),
  isPrimary: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});

export const ProductFeatureSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const ProductSpecificationSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const ProvisionalIngredientCategorySchema = z.object({
  category: z.string().min(1),
  items: z.array(z.string()).min(1),
  purpose: z.string().min(1),
});

export const ProductDirectionSchema = z.object({
  step: z.string().min(1),
  instruction: z.string().min(1),
});

export const ProductSeoSchema = z.object({
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  keywords: z.array(z.string()).default([]),
  ogImage: z.string().optional(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lower-case alphanumeric with hyphens'),
  tagline: z.string().min(3),
  shortDescription: z.string().min(10),
  fullDescription: z.string().min(20),
  category: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
  }),
  status: z.enum(['draft', 'active', 'archived']).default('active'),
  isFeatured: z.boolean().default(false),
  servingSize: z.string().min(1),
  baseSku: z.string().min(1, 'Base SKU is required (e.g. GG-DWF-200G)'),
  netWeightGrams: z.number().int().min(1),
  hsnCode: z.string().min(4, 'HSN Code is required for GST compliance'),
  gstRateBasisPoints: z
    .number()
    .int()
    .min(0)
    .max(2800)
    .default(1800), // Default 18.00%
  packOptions: z.array(ProductPackOptionSchema).min(1, 'At least 1 pack option is required'),
  images: z.array(ProductImageSchema).min(1, 'At least 1 image is required'),
  highlights: z.array(z.string()).default([]),
  features: z.array(ProductFeatureSchema).default([]),
  specifications: z.array(ProductSpecificationSchema).default([]),
  ingredientsNote: z.string().default(''),
  provisionalIngredients: z.array(ProvisionalIngredientCategorySchema).default([]),
  directions: z.array(ProductDirectionSchema).default([]),
  safetyInformation: z.array(z.string()).default([]),
  storageInstructions: z.string().default(''),
  seo: ProductSeoSchema,
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
