import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isValidSlotStart } from "@/lib/availability";
import { getBookingProfile, type BookingProfile } from "@/server/availability";
import type { BookingInput } from "@/lib/validation";

export type CreateBookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; reason: "NOT_FOUND" | "SLOT_UNAVAILABLE" };

export async function createPendingBooking(
  input: BookingInput,
): Promise<CreateBookingResult> {
  const profile = await getBookingProfile(input.slug);
  if (!profile) return { ok: false, reason: "NOT_FOUND" };

  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(
    startsAt.getTime() + profile.sessionType.durationMinutes * 60_000,
  );

  // Bookings that could collide with this one.
  const busy = await prisma.booking.findMany({
    where: {
      consultantId: profile.consultantId,
      status: { not: "CANCELLED" },
      startsAt: { lt: endsAt },
      endsAt: { gt: startsAt },
    },
    select: { startsAt: true, endsAt: true },
  });

  const isValid = isValidSlotStart(startsAt, {
    rules: profile.rules,
    timezone: profile.timezone,
    durationMinutes: profile.sessionType.durationMinutes,
    busy,
  });

  if (!isValid) return { ok: false, reason: "SLOT_UNAVAILABLE" };

  return insertBooking(profile, input, startsAt, endsAt);
}

async function insertBooking(
  profile: BookingProfile,
  input: BookingInput,
  startsAt: Date,
  endsAt: Date,
): Promise<CreateBookingResult> {
  try {
    const bookingId = await prisma.$transaction(
      async (tx) => {
        const conflict = await tx.booking.findFirst({
          where: {
            consultantId: profile.consultantId,
            status: { not: "CANCELLED" },
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
          },
          select: { id: true },
        });

        if (conflict) return null;

        const existing = await tx.client.findFirst({
          where: { email: input.email },
          select: { id: true },
        });

        const client =
          existing ??
          (await tx.client.create({
            data: { email: input.email, name: input.name },
            select: { id: true },
          }));

        const booking = await tx.booking.create({
          data: {
            consultantId: profile.consultantId,
            sessionTypeId: profile.sessionTypeId,
            clientId: client.id,
            startsAt,
            endsAt,
            status: "PENDING",
            priceAtBooking: profile.sessionType.priceCents,
            currencyAtBooking: profile.sessionType.currency,
            projectDescription: input.projectDescription,
            budgetRange: input.budgetRange,
            timeline: input.timeline,
          },
          select: { id: true },
        });

        return booking.id;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return bookingId
      ? { ok: true, bookingId }
      : { ok: false, reason: "SLOT_UNAVAILABLE" };
  } catch (error) {
    // P2034: write conflict — another transaction won the same slot.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return { ok: false, reason: "SLOT_UNAVAILABLE" };
    }
    throw error;
  }
}