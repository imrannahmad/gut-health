import { z } from 'zod';

export const SubmitReviewInputSchema = z.object({
  productId: z.string().trim().min(1, 'Product ID or slug is required'),
  orderId: z.string().trim().min(1, 'Valid Order ID is required for verified purchase verification'),
  rating: z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().trim().min(2, 'Review title must be at least 2 characters').max(120, 'Review title cannot exceed 120 characters'),
  comment: z.string().trim().min(5, 'Review commentary must be at least 5 characters').max(2000, 'Review commentary cannot exceed 2000 characters'),
  customerName: z.string().trim().min(1).max(80).optional(),
  customerEmail: z.string().trim().email('Valid email is required').optional(),
});

export type SubmitReviewInput = z.infer<typeof SubmitReviewInputSchema>;

export const ModerateReviewInputSchema = z.object({
  action: z.enum(['approve', 'reject', 'approved', 'rejected']).transform((val) => {
    if (val === 'approve') return 'approved';
    if (val === 'reject') return 'rejected';
    return val;
  }),
  moderatorNotes: z.string().trim().max(500).optional(),
});

export type ModerateReviewInput = z.infer<typeof ModerateReviewInputSchema>;

export const ListPublicReviewsQuerySchema = z.object({
  productId: z.string().trim().min(1, 'Product ID is required'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z.enum(['latest', 'highest', 'lowest']).default('latest'),
});

export type ListPublicReviewsQuery = z.infer<typeof ListPublicReviewsQuerySchema>;

export const ListAdminReviewsQuerySchema = z.object({
  productId: z.string().trim().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListAdminReviewsQuery = z.infer<typeof ListAdminReviewsQuerySchema>;
