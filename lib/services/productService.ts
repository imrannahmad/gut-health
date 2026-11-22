import { productRepository } from '@/lib/repositories/productRepository';
import { categoryRepository } from '@/lib/repositories/categoryRepository';
import { adminDb } from '@/lib/firebase/admin';
import {
  CreateProductSchema,
  UpdateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from '@/lib/validations/productSchema';
import type { FirestoreProduct, ProductPackOption } from '@/types/firestore/product';

export interface EnrichedProduct extends FirestoreProduct {
  inventoryStatus?: {
    sku: string;
    quantityAvailable: number;
    isInStock: boolean;
  };
}

export class ProductService {
  /**
   * Calculate exact tax breakdown in integer paise for a GST-inclusive selling price.
   * e.g., ₹1,999 (199900 paise) with 18% GST (1800 basis points):
   * Base = 199900 * 10000 / (10000 + 1800) = 169407 paise (₹1,694.07)
   * GST = 199900 - 169407 = 30493 paise (₹304.93)
   */
  calculateGstBreakdown(sellingPriceInPaise: number, gstRateBasisPoints: number = 1800) {
    const basePriceInPaise = Math.round(
      (sellingPriceInPaise * 10000) / (10000 + gstRateBasisPoints)
    );
    const totalGstInPaise = sellingPriceInPaise - basePriceInPaise;
    const cgstInPaise = Math.floor(totalGstInPaise / 2);
    const sgstInPaise = totalGstInPaise - cgstInPaise;

    return {
      sellingPriceInPaise,
      basePriceInPaise,
      totalGstInPaise,
      cgstInPaise,
      sgstInPaise,
      igstInPaise: totalGstInPaise,
      gstRatePercent: gstRateBasisPoints / 100,
    };
  }

  /**
   * Fetch an active product by slug with live physical stock availability
   */
  async getProductBySlug(slug: string): Promise<EnrichedProduct | null> {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      return null;
    }

    return this.enrichWithInventory(product);
  }

  /**
   * Fetch any product by document ID (including drafts for Admin)
   */
  async getProductById(id: string): Promise<EnrichedProduct | null> {
    const product = await productRepository.findById(id);
    if (!product) {
      return null;
    }

    return this.enrichWithInventory(product);
  }

  /**
   * List active products for storefront catalog
   */
  async listActiveProducts(limit: number = 20) {
    return productRepository.listActive({ limit });
  }

  /**
   * List all products for admin console (drafts, active, archived)
   */
  async listAllProductsForAdmin(limit: number = 50) {
    return productRepository.list({ limit });
  }

  /**
   * Create a new product document with full validation
   */
  async createProduct(rawInput: unknown): Promise<FirestoreProduct> {
    const validated = CreateProductSchema.parse(rawInput);

    // Check if slug is already taken
    const existing = await productRepository.findBySlug(validated.slug);
    if (existing) {
      throw new Error(`A product with slug "${validated.slug}" already exists.`);
    }

    const productId = validated.slug;
    const newProductData = {
      ...validated,
      averageRating: 5.0,
      reviewCount: 0,
      totalPhysicalJarsSold: 0,
    };

    const created = await productRepository.create(productId, newProductData as any);

    if (validated.category?.id) {
      await categoryRepository.updateProductCount(validated.category.id, 1).catch((err) => {
        console.warn('[ProductService] Category count increment notice:', err);
      });
    }

    return created;
  }

  /**
   * Update an existing product document
   */
  async updateProduct(id: string, rawInput: unknown): Promise<void> {
    const validated = UpdateProductSchema.parse(rawInput);
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error(`Product with ID "${id}" not found.`);
    }

    // If category changed, adjust counts
    if (validated.category?.id && validated.category.id !== existing.category?.id) {
      await Promise.all([
        categoryRepository.updateProductCount(existing.category.id, -1).catch(() => {}),
        categoryRepository.updateProductCount(validated.category.id, 1).catch(() => {}),
      ]);
    }

    await productRepository.update(id, validated as any);
  }

  /**
   * Permanently delete a product document
   */
  async deleteProduct(id: string): Promise<void> {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error(`Product with ID "${id}" not found.`);
    }

    if (existing.category?.id) {
      await categoryRepository.updateProductCount(existing.category.id, -1).catch(() => {});
    }

    await productRepository.delete(id);
  }

  /**
   * Archive a product (soft delete)
   */
  async archiveProduct(id: string): Promise<void> {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error(`Product with ID "${id}" not found.`);
    }

    await productRepository.update(id, { status: 'archived' } as any);

    if (existing.category?.id) {
      await categoryRepository.updateProductCount(existing.category.id, -1).catch(() => {});
    }
  }

  /**
   * Helper to attach physical warehouse inventory counts
   */
  private async enrichWithInventory(product: FirestoreProduct): Promise<EnrichedProduct> {
    try {
      const invSnap = await adminDb.collection('inventory').doc(product.baseSku).get();
      if (invSnap.exists) {
        const invData = invSnap.data();
        const available = Number(invData?.quantityAvailable || 0);
        return {
          ...product,
          inventoryStatus: {
            sku: product.baseSku,
            quantityAvailable: available,
            isInStock: available > 0,
          },
        };
      }
    } catch (err) {
      console.warn(`[ProductService] Inventory lookup notice for ${product.baseSku}:`, err);
    }

    // Default optimistic assumption if inventory document is not yet initialized
    return {
      ...product,
      inventoryStatus: {
        sku: product.baseSku,
        quantityAvailable: 100,
        isInStock: true,
      },
    };
  }
}

export const productService = new ProductService();
