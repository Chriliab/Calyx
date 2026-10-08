import { notFound } from "next/navigation";
import { getBookingProfile, getSlotsForRange } from "@/server/availability";
import { formatPrice, weekRangeUtc } from "@/lib/display";
import { SlotPicker } from "./SlotPicker";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
}: {
  params: { slug: string };
}) {
  const profile = await getBookingProfile(params.slug);
  if (!profile) notFound();

  const { rangeStart, rangeEnd } = weekRangeUtc(profile.timezone, 0);
  const slots = await getSlotsForRange(profile, rangeStart, rangeEnd);

  const { sessionType } = profile;

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold">{profile.name}</h1>
        <p className="mt-2 text-lg text-neutral-400">{sessionType.title}</p>
        <p className="mt-1 text-sm text-neutral-500">
          {sessionType.durationMinutes} minutes ·{" "}
          {formatPrice(sessionType.priceCents, sessionType.currency)}
        </p>
      </header>

      <SlotPicker
        slug={params.slug}
        timezone={profile.timezone}
        initialSlots={slots.map((slot) => ({
          startsAt: slot.startsAt.toISOString(),
          endsAt: slot.endsAt.toISOString(),
        }))}
      />
    </main>
  );
}