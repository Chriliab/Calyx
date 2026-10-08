import { z } from "zod";

export const BUDGET_RANGES = [
  "Under 1,000 EUR",
  "1,000 - 5,000 EUR",
  "5,000 - 10,000 EUR",
  "Over 10,000 EUR",
  "Not sure yet",
] as const;

export const TIMELINES = [
  "As soon as possible",
  "Within a month",
  "1-3 months",
  "Just exploring",
] as const;

export const bookingInputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Invalid slug"),
  startsAt: z.string().datetime({ message: "Invalid time" }),
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email")
    .max(254),
  projectDescription: z
    .string()
    .trim()
    .min(10, "Please describe your project in a little more detail")
    .max(2000),
  budgetRange: z.enum(BUDGET_RANGES),
  timeline: z.enum(TIMELINES),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

