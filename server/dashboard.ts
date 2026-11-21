import { prisma } from "@/lib/prisma";
import { DateTime } from "luxon";
import { resend, EMAIL_FROM } from "@/lib/email";
import { clientCancellationEmail } from "@/lib/emails/booking-cancelled";


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
export type CancelResult = { ok: true } | { ok: false };

/**
 * Cancel one of this consultant's upcoming confirmed bookings.
 * Ownership, state and timing are checked in a single conditional update.
 */
export async function cancelBookingForConsultant(
  bookingId: string,
  consultantId: string,
): Promise<CancelResult> {
  const { count } = await prisma.booking.updateMany({
    where: {
      id: bookingId,
      consultantId,
      status: "CONFIRMED",
      startsAt: { gt: new Date() },
    },
    data: { status: "CANCELLED" },
  });

  if (count === 0) return { ok: false };

  await sendCancellationEmail(bookingId);
  return { ok: true };
}


async function sendCancellationEmail(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      startsAt: true,
      consultant: { select: { name: true, email: true, timezone: true } },
      sessionType: { select: { title: true } },
      client: { select: { name: true, email: true } },
    },
  });

  if (!booking) return;

  const when = DateTime.fromJSDate(booking.startsAt, {
    zone: booking.consultant.timezone,
  }).toFormat("cccc d LLLL yyyy 'at' HH:mm");

  const email = clientCancellationEmail({
    clientName: booking.client.name,
    consultantName: booking.consultant.name,
    sessionTitle: booking.sessionType.title,
    when,
    timezone: booking.consultant.timezone,
  });

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: booking.client.email,
      replyTo: booking.consultant.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    if (error) console.error("Cancellation email rejected", bookingId, error);
  } catch (error) {
    console.error("Cancellation email failed", bookingId, error);
  }
}