import { notFound } from "next/navigation";
import { DateTime } from "luxon";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const {booking: bookingId} = await searchParams;
  if (!bookingId) notFound();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      status: true,
      startsAt: true,
      consultant: { select: { name: true, timezone: true } },
      sessionType: { select: { title: true } },
    },
  });

  if (!booking) notFound();

  const when = DateTime.fromJSDate(booking.startsAt, {
    zone: booking.consultant.timezone,
  }).toFormat("cccc d LLLL 'at' HH:mm");

  const isConfirmed = booking.status === "CONFIRMED";

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold">
        {isConfirmed ? "Booking confirmed" : "Payment received"}
      </h1>

      <p className="mt-4 text-neutral-400">
        {booking.sessionType.title} with {booking.consultant.name}
      </p>
      <p className="mt-1 text-neutral-400">
        {when} ({booking.consultant.timezone})
      </p>

      {!isConfirmed && (
        <p className="mt-6 rounded-md border border-neutral-700 p-4 text-sm text-neutral-400">
          We&apos;re still confirming your payment. You&apos;ll get an email as
          soon as it&apos;s done.
        </p>
      )}
    </main>
  );
}