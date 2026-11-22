import { z } from 'zod';

export const ClaimReasonSchema = z.enum([
  'damaged_in_transit',
  'broken_seal',
  'incorrect_item',
  'unopened_return',
]);

export const CheckClaimEligibilitySchema = z.object({
  orderId: z
    .string()
    .trim()
    .regex(/^GG-\d{4}-\d{6}$/, 'Order ID must follow format GG-YYMM-XXXXXX (e.g. GG-2611-000001)'),
  customerPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
});

export const ClaimItemInputSchema = z.object({
  baseSku: z.string().min(1, 'Base SKU is required'),
  packOptionId: z.string().min(1, 'Pack Option ID is required'),
  packName: z.string().optional(),
  physicalUnitsCount: z.number().int().min(1).default(1),
  reason: ClaimReasonSchema,
});

export const CreateClaimInputSchema = z.object({
  orderId: z
    .string()
    .trim()
    .regex(/^GG-\d{4}-\d{6}$/, 'Order ID must follow format GG-YYMM-XXXXXX'),
  customerPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
  customerEmail: z.string().trim().email('Invalid email address').optional(),
  reason: ClaimReasonSchema,
  damagedImageUrls: z
    .array(z.string().min(1))
    .min(1, 'Please upload at least 1 photo proving parcel damage, broken seal, or incorrect item'),
  customerNotes: z
    .string()
    .trim()
    .min(10, 'Please describe the damage or issue in at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  items: z.array(ClaimItemInputSchema).min(1, 'At least 1 item must be specified for the claim'),
});

export const AdminReviewClaimSchema = z.object({
  action: z.enum(['approve_replacement', 'reject', 'issue_refund']),
  adminNotes: z.string().trim().max(1000).optional(),
  rejectionReason: z.string().trim().max(1000).optional(),
  refundAmountInPaise: z.number().int().positive().optional(),
});

export const AdminClaimFilterSchema = z.object({
  status: z.enum(['all', 'requested', 'inspection_pending', 'approved', 'rejected', 'completed']).optional().default('all'),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CheckClaimEligibilityInput = z.infer<typeof CheckClaimEligibilitySchema>;
export type CreateClaimInput = z.infer<typeof CreateClaimInputSchema>;
export type AdminReviewClaimInput = z.infer<typeof AdminReviewClaimSchema>;
export type AdminClaimFilterInput = z.infer<typeof AdminClaimFilterSchema>;
