import type { DashboardBooking } from "@/server/dashboard";
import { formatBookingWindow } from "@/lib/display";

type Props = {
  bookings: DashboardBooking[];
  timezone: string;
};

export function BookingList({ bookings, timezone }: Props) {
  if (bookings.length === 0) {
    return <p className="text-neutral-400">No upcoming bookings yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {bookings.map((booking) => (
        <li
          key={booking.id}
          className="rounded-lg border border-neutral-800 p-5"
        >
          <p className="font-medium">
            {formatBookingWindow(booking.startsAt, booking.endsAt, timezone)}
          </p>
          <p className="mt-1 text-sm text-neutral-400">
            {booking.client.name} ·{" "}
            <a
              href={`mailto:${booking.client.email}`}
              className="text-blue-400 underline"
            >
              {booking.client.email}
            </a>
          </p>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-neutral-500">Budget</dt>
              <dd>{booking.budgetRange}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Timeline</dt>
              <dd>{booking.timeline}</dd>
            </div>
          </dl>

          <div className="mt-4 text-sm">
            <p className="text-neutral-500">Project</p>
            <p className="mt-1 whitespace-pre-wrap">
              {booking.projectDescription}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}