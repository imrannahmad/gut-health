import { z } from 'zod';

export const INDIAN_GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli and Daman & Diu',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh (Old)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
};

export const AddressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number starting with 6-9'),
  addressLine1: z.string().min(5, 'Street address must be at least 5 characters').max(150),
  addressLine2: z.string().max(150).optional().or(z.literal('')),
  landmark: z.string().max(100).optional().or(z.literal('')),
  city: z.string().min(2, 'City is required').max(50),
  state: z.string().min(2, 'State is required').max(50),
  stateCode: z
    .string()
    .length(2, 'GST state code must be exactly 2 digits (e.g. "27" for Maharashtra)')
    .refine((val) => val in INDIAN_GST_STATE_CODES, {
      message: 'Invalid Indian GST state code',
    }),
  pincode: z
    .string()
    .regex(/^\d{6}$/, 'PIN code must be exactly 6 digits'),
  country: z.literal('India').default('India'),
  isDefaultShipping: z.boolean().default(false),
  isDefaultBilling: z.boolean().default(false),
});

export const UpdateAddressSchema = AddressSchema.partial();

export type AddressInput = z.infer<typeof AddressSchema>;
export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>;
