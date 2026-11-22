import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').default(''),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
