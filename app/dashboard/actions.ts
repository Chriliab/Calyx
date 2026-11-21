"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  cancelBookingForConsultant,
  type CancelResult,
} from "@/server/dashboard";

const bookingIdSchema = z.string().min(1).max(64);

export async function cancelBooking(bookingId: unknown): Promise<CancelResult> {
  const { userId } = await auth();
  if (!userId) return { ok: false };

  const parsed = bookingIdSchema.safeParse(bookingId);
  if (!parsed.success) return { ok: false };

  const result = await cancelBookingForConsultant(parsed.data, userId);

  if (result.ok) revalidatePath("/dashboard");
  return result;
}