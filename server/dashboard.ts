import { prisma } from "@/lib/prisma";

const MAX_BOOKINGS = 50;

export type DashboardBooking = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  projectDescription: string;
  budgetRange: string;
  timeline: string;
  client: { name: string; email: string };
};

/**
 * Upcoming confirmed bookings for one consultant.
 * Scoped by the signed-in user's ID — never by an ID from the request.
 */
export async function getUpcomingBookings(
  consultantId: string,
): Promise<DashboardBooking[]> {
  return prisma.booking.findMany({
    where: {
      consultantId,
      status: "CONFIRMED",
      endsAt: { gt: new Date() },
    },
    orderBy: { startsAt: "asc" },
    take: MAX_BOOKINGS,
    select: {
      id: true,
      startsAt: true,
      endsAt: true,
      projectDescription: true,
      budgetRange: true,
      timeline: true,
      client: { select: { name: true, email: true } },
    },
  });
}