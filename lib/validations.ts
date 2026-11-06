import { z } from "zod";

export const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number cannot exceed 15 digits")
    .regex(/^[0-9+\s()-]+$/, "Please enter a valid phone number"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  addressLine1: z.string().min(5, "Delivery address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z
    .string()
    .length(6, "Indian Pincode must be exactly 6 digits")
    .regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit Indian PIN code"),
  orderNotes: z.string().optional(),
  paymentMethod: z.enum(["upi", "card", "netbanking", "cod"], {
    message: "Please select a payment method",
  }),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type NewsletterFormValues = z.infer<typeof newsletterSchema>;
