import { prisma } from "@/lib/prisma";
import { generateSlots, type Interval } from "@/lib/availability";

const MAX_RANGE_DAYS = 60;

export type PublicAvailability = {
  consultant: { name: string; timezone: string };
  sessionType: {
    title: string;
    durationMinutes: number;
    priceCents: number;
    currency: string;
  };
  slots: Interval[];
};

export async function getPublicAvailability(params: {
  slug: string;
  rangeStart: Date;
  rangeEnd: Date;
}): Promise<PublicAvailability | null> {
  const { slug, rangeStart } = params;

  // Cap the window so one request can't ask for a decade of slots.
  const maxEnd = new Date(rangeStart.getTime() + MAX_RANGE_DAYS * 86_400_000);
  const rangeEnd = params.rangeEnd > maxEnd ? maxEnd : params.rangeEnd;
  if (rangeEnd <= rangeStart) return null;

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

  const busy = await prisma.booking.findMany({
    where: {
      consultantId: consultant.id,
      status: { not: "CANCELLED" },
      startsAt: { lt: rangeEnd },
      endsAt: { gt: rangeStart },
    },
    select: { startsAt: true, endsAt: true },
  });

  const slots = generateSlots({
    rules: consultant.availabilityRules,
    timezone: consultant.timezone,
    durationMinutes: sessionType.durationMinutes,
    busy,
    rangeStart,
    rangeEnd,
  });

  return {
    consultant: { name: consultant.name, timezone: consultant.timezone },
    sessionType,
    slots,
  };
}