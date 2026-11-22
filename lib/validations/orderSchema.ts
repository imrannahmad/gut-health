import { z } from 'zod';
import { INDIAN_GST_STATE_CODES } from './addressSchema';

export const OrderAddressInputSchema = z.object({
  addressLine1: z.string().min(3).max(150),
  addressLine2: z.string().max(150).optional().or(z.literal('')),
  landmark: z.string().max(100).optional().or(z.literal('')),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  stateCode: z
    .string()
    .length(2)
    .refine((val) => val in INDIAN_GST_STATE_CODES, {
      message: 'Invalid Indian GST state code',
    }),
  pincode: z.string().regex(/^\d{6}$/, 'PIN code must be exactly 6 digits'),
  country: z.literal('India').default('India'),
  buyerGstin: z.string().max(15).optional().or(z.literal('')),
});

export const OrderCustomerInputSchema = z.object({
  uid: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().max(50).default(''),
  isGuest: z.boolean().default(false),
});

export const OrderItemInputSchema = z.object({
  productId: z.string().min(1),
  packOptionId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
});

export const CreateOrderInputSchema = z.object({
  customer: OrderCustomerInputSchema,
  shippingAddress: OrderAddressInputSchema,
  billingAddress: OrderAddressInputSchema.optional(),
  items: z.array(OrderItemInputSchema).min(1, 'At least one item is required in an order'),
  paymentMode: z.enum(['prepaid', 'partial_cod']),
  couponCode: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export const TrackOrderInputSchema = z.object({
  orderNumber: z.string().min(3, 'Order number or AWB is required'),
  emailOrPhone: z.string().min(3, 'Email or Phone is required to verify identity'),
});

export const AdminOrderFilterSchema = z.object({
  status: z.string().optional(),
  paymentMode: z.enum(['prepaid', 'partial_cod']).optional(),
  advancePaymentStatus: z.string().optional(),
  balanceCollectionStatus: z.string().optional(),
  shipmentStatus: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  page: z.coerce.number().int().min(1).default(1),
});

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;
export type TrackOrderInput = z.infer<typeof TrackOrderInputSchema>;
export type AdminOrderFilterInput = z.infer<typeof AdminOrderFilterSchema>;
