import * as z from 'zod';

const phoneRegex = /^0\d{1,2}-?\d{7}$/;
const addressRegex = /[א-תa-zA-Z]/; // At least one letter

export const emailSchema = z.string()
  .min(1, 'אימייל הוא שדה חובה')
  .email('כתובת אימייל לא תקינה');

export const passwordSchema = z.string()
  .min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים');

export const nameSchema = z.string()
  .min(2, 'השם חייב להכיל לפחות 2 תווים');

export const phoneSchema = z.string()
  .min(1, 'מספר טלפון הוא שדה חובה')
  .regex(phoneRegex, 'מספר טלפון לא תקין (לדוגמה: 050-1234567)');

export const streetSchema = z.string()
  .min(3, 'כתובת קצרה מדי')
  .refine(val => addressRegex.test(val), 'כתובת חייבת להכיל אותיות');

export const citySchema = z.string()
  .min(2, 'עיר לא תקינה');

export const postalCodeSchema = z.string()
  .optional();

// Auth Schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
});

// Contact Schema
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(2, 'נושא קצר מדי'),
  message: z.string().min(10, 'הודעה חייבת להכיל לפחות 10 תווים'),
});

// Shipping Schema
export const shippingSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  street: streetSchema,
  city: citySchema,
  postalCode: postalCodeSchema,
  country: z.string().min(1, 'מדינה היא שדה חובה'),
});

// Payment Schema
export const paymentSchema = z.object({
  cardNumber: z.string().min(16, 'מספר כרטיס לא תקין').max(19, 'מספר כרטיס לא תקין'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'פורמט תוקף לא תקין (MM/YY)'),
  cvv: z.string().min(3, 'CVV לא תקין').max(4, 'CVV לא תקין'),
});

// Profile Schema
export const profileSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
});

// Address Schema
export const addressFormSchema = z.object({
  name: z.string().min(2, 'כינוי קצר מדי'),
  street: streetSchema,
  city: citySchema,
  postalCode: postalCodeSchema,
  country: z.string().min(1, 'מדינה היא שדה חובה'),
  isDefault: z.boolean(),
});

// Checkout Schema (Combined)
export const checkoutSchema = z.object({
  // Shipping
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  street: streetSchema,
  city: citySchema,
  postalCode: postalCodeSchema,
  country: z.string().min(1, 'מדינה היא שדה חובה'),
  // Payment
  cardNumber: z.string().min(16, 'מספר כרטיס לא תקין').max(19, 'מספר כרטיס לא תקין'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'פורמט תוקף לא תקין (MM/YY)'),
  cvv: z.string().min(3, 'CVV לא תקין').max(4, 'CVV לא תקין'),
  // Coupon
  couponCode: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ShippingInput = z.infer<typeof shippingSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type AddressFormInput = z.infer<typeof addressFormSchema>;
