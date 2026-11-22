import { categoryRepository } from '@/lib/repositories/categoryRepository';
import {
  CreateCategorySchema,
  UpdateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '@/lib/validations/categorySchema';
import type { FirestoreCategory } from '@/types/firestore/product';

export class CategoryService {
  /**
   * List active categories for public navigation and catalog filtering
   */
  async listActiveCategories(): Promise<FirestoreCategory[]> {
    return categoryRepository.listActive();
  }

  /**
   * List all categories for admin console
   */
  async listAllCategoriesForAdmin(): Promise<FirestoreCategory[]> {
    return categoryRepository.listAll();
  }

  /**
   * Retrieve single category by document ID
   */
  async getCategoryById(id: string): Promise<FirestoreCategory | null> {
    return categoryRepository.findById(id);
  }

  /**
   * Retrieve single category by slug
   */
  async getCategoryBySlug(slug: string): Promise<FirestoreCategory | null> {
    return categoryRepository.findBySlug(slug);
  }

  /**
   * List active categories formatted specifically for form selector dropdowns
   */
  async getCategoryOptions(): Promise<Array<{ id: string; name: string; slug: string }>> {
    const categories = await this.listActiveCategories();
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    }));
  }

  /**
   * Create a new category
   */
  async createCategory(rawInput: unknown): Promise<FirestoreCategory> {
    const validated = CreateCategorySchema.parse(rawInput);

    // Check slug uniqueness
    const existing = await categoryRepository.findBySlug(validated.slug);
    if (existing) {
      throw new Error(`A category with slug "${validated.slug}" already exists.`);
    }

    const categoryId = validated.slug;
    const categoryData = {
      ...validated,
      productCount: 0,
    };

    return categoryRepository.create(categoryId, categoryData as any);
  }

  /**
   * Update category
   */
  async updateCategory(id: string, rawInput: unknown): Promise<void> {
    const validated = UpdateCategorySchema.parse(rawInput);
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new Error(`Category with ID "${id}" not found.`);
    }

    // If slug is changed, ensure uniqueness
    if (validated.slug && validated.slug !== existing.slug) {
      const duplicate = await categoryRepository.findBySlug(validated.slug);
      if (duplicate && duplicate.id !== id) {
        throw new Error(`A category with slug "${validated.slug}" already exists.`);
      }
    }

    await categoryRepository.update(id, validated as any);
  }

  /**
   * Delete or deactivate category.
   * If products are linked, performs a safe deactivation rather than data-loss delete.
   */
  async deleteCategory(id: string): Promise<{ action: 'deleted' | 'deactivated'; message: string }> {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new Error(`Category with ID "${id}" not found.`);
    }

    if (existing.productCount && existing.productCount > 0) {
      // Soft-deactivate if products are still assigned
      await categoryRepository.update(id, { isActive: false } as any);
      return {
        action: 'deactivated',
        message: `Category "${existing.name}" has ${existing.productCount} active products. It has been deactivated instead of deleted to protect product relations.`,
      };
    }

    await categoryRepository.delete(id);
    return {
      action: 'deleted',
      message: `Category "${existing.name}" was successfully removed.`,
    };
  }
}

export const categoryService = new CategoryService();
