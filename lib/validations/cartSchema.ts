import { z } from 'zod';

export const CartItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  packOptionId: z.string().min(1, 'Pack Option ID is required'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(10, 'Maximum 10 packs per item allowed per order'),
});

export const ValidateCartInputSchema = z.object({
  items: z.array(CartItemInputSchema),
});

export const SyncCartInputSchema = z.object({
  items: z.array(CartItemInputSchema),
});

export const WishlistActionSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export type CartItemInput = z.infer<typeof CartItemInputSchema>;
export type ValidateCartInput = z.infer<typeof ValidateCartInputSchema>;
export type SyncCartInput = z.infer<typeof SyncCartInputSchema>;
export type WishlistActionInput = z.infer<typeof WishlistActionSchema>;
