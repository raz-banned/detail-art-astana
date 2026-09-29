import { z } from "zod";

// Booking fields shared by the public form on the homepage and the CRM's manual entry,
// so both validate a phone number or name the same way.
export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя (минимум 2 символа)").max(80, "Имя слишком длинное"),
  phone: z
    .string()
    .trim()
    .min(10, "Укажите корректный номер телефона")
    .max(20, "Номер слишком длинный")
    .regex(/^[\d+()\-\s]+$/, "Номер может содержать только цифры и знаки + ( ) -"),
  car: z.string().trim().max(80, "Слишком длинное название авто"),
  service: z.string().trim().min(1, "Укажите услугу").max(120, "Слишком длинное название услуги"),
  date: z.string().trim().max(20),
});
