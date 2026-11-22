import { z } from 'zod';

export const UpdateCustomerProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50).optional(),
  lastName: z.string().max(50).optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number')
    .optional()
    .or(z.literal('')),
});

export type UpdateCustomerProfileInput = z.infer<typeof UpdateCustomerProfileSchema>;

export const SupportNoteSchema = z.object({
  note: z.string().min(2, 'Note must be at least 2 characters').max(2000, 'Note cannot exceed 2000 characters'),
});

export type SupportNoteInput = z.infer<typeof SupportNoteSchema>;
