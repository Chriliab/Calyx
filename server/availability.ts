import { prisma } from "@/lib/prisma";
import {
  generateSlots,
  type AvailabilityRule,
  type Interval,
} from "@/lib/availability";

const MAX_RANGE_DAYS = 60;

export type SessionTypeSummary = {
  title: string;
  durationMinutes: number;
  priceCents: number;
  currency: string;
};

export type BookingProfile = {
  consultantId: string;
  name: string;
  timezone: string;
  rules: AvailabilityRule[];
  sessionType: SessionTypeSummary;
};

/** Everything the booking page needs before it knows which week to show. */
export async function getBookingProfile(
  slug: string,
): Promise<BookingProfile | null> {
  const consultant = await prisma.consultant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      timezone: true,
      availabilityRules: {
        select: { dayOfWeek: true, startMinute: true, endMinute: true },
      },
      sessionTypes: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: {
          title: true,
          durationMinutes: true,
          priceCents: true,
          currency: true,
        },
      },
    },
  });

  const sessionType = consultant?.sessionTypes[0];
  if (!consultant || !sessionType) return null;

  return {
    consultantId: consultant.id,
    name: consultant.name,
    timezone: consultant.timezone,
    rules: consultant.availabilityRules,
    sessionType,
  };
}

/** Bookable slots for one window, with the range capped. */
export async function getSlotsForRange(
  profile: BookingProfile,
  rangeStart: Date,
  requestedEnd: Date,
): Promise<Interval[]> {
  const maxEnd = new Date(rangeStart.getTime() + MAX_RANGE_DAYS * 86_400_000);
  const rangeEnd = requestedEnd > maxEnd ? maxEnd : requestedEnd;
  if (rangeEnd <= rangeStart) return [];

  const busy = await prisma.booking.findMany({
    where: {
      consultantId: profile.consultantId,
      status: { not: "CANCELLED" },
      startsAt: { lt: rangeEnd },
      endsAt: { gt: rangeStart },
    },
    select: { startsAt: true, endsAt: true },
  });

  return generateSlots({
    rules: profile.rules,
    timezone: profile.timezone,
    durationMinutes: profile.sessionType.durationMinutes,
    busy,
    rangeStart,
    rangeEnd,
  });
}
export type PublicAvailability = {
  consultant: { name: string; timezone: string };
  sessionType: SessionTypeSummary;
  slots: Interval[];
};

export async function getPublicAvailability(params: {
  slug: string;
  rangeStart: Date;
  rangeEnd: Date;
}): Promise<PublicAvailability | null> {
  const profile = await getBookingProfile(params.slug);
  if (!profile) return null;

  const slots = await getSlotsForRange(
    profile,
    params.rangeStart,
    params.rangeEnd,
  );

  return {
    consultant: { name: profile.name, timezone: profile.timezone },
    sessionType: profile.sessionType,
    slots,
  };
}