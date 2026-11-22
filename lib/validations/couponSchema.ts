import { z } from 'zod';

export const ValidateCouponInputSchema = z.object({
  code: z
    .string()
    .min(1, 'Coupon code is required')
    .max(30)
    .transform((val) => val.trim().toUpperCase()),
  subtotalInPaise: z.number().int().min(1, 'Order subtotal must be greater than 0'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerUid: z.string().optional().or(z.literal('')),
  items: z
    .array(
      z.object({
        productId: z.string(),
        packOptionId: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .optional(),
});

export const CreateCouponInputSchema = z
  .object({
    code: z
      .string()
      .min(2, 'Code must be at least 2 characters')
      .max(30, 'Code cannot exceed 30 characters')
      .regex(/^[A-Za-z0-9_-]+$/, 'Coupon code can only contain letters, numbers, hyphens, and underscores')
      .transform((val) => val.trim().toUpperCase()),
    type: z.enum(['percentage', 'flat']),
    value: z.number().min(1, 'Value must be greater than 0'),
    minOrderValueInPaise: z.number().int().min(0).default(0),
    maxDiscountAmountInPaise: z.number().int().min(0).optional(),
    maxTotalUses: z.number().int().min(1).default(1000),
    maxUsesPerCustomer: z.number().int().min(1).default(1),
    isActive: z.boolean().default(true),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    firstTimeCustomerOnly: z.boolean().default(false),
    applicableProductIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'percentage' && data.value > 100) {
        return false;
      }
      return true;
    },
    {
      message: 'Percentage discount cannot exceed 100%',
      path: ['value'],
    }
  );

export const UpdateCouponInputSchema = z.object({
  type: z.enum(['percentage', 'flat']).optional(),
  value: z.number().min(1).optional(),
  minOrderValueInPaise: z.number().int().min(0).optional(),
  maxDiscountAmountInPaise: z.number().int().min(0).optional().nullable(),
  maxTotalUses: z.number().int().min(1).optional(),
  maxUsesPerCustomer: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  firstTimeCustomerOnly: z.boolean().optional(),
  applicableProductIds: z.array(z.string()).optional(),
});

export type ValidateCouponInput = z.infer<typeof ValidateCouponInputSchema>;
export type CreateCouponInput = z.infer<typeof CreateCouponInputSchema>;
export type UpdateCouponInput = z.infer<typeof UpdateCouponInputSchema>;
