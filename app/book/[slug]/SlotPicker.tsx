"use client";
import { BookingForm } from "./BookingForm";
import { useState } from "react";
import {
  groupSlotsByDay,
  weekLabel,
  weekRangeUtc,
  type SlotDTO,
} from "@/lib/display";

const MAX_WEEKS_AHEAD = 8;

type Props = {
  slug: string;
  timezone: string;
  initialSlots: SlotDTO[];
};

export function SlotPicker({ slug, timezone, initialSlots }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState<SlotDTO[]>(initialSlots);
  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function goToWeek(offset: number) {
    setIsLoading(true);
    setError(null);

    try {
      const { rangeStart, rangeEnd } = weekRangeUtc(timezone, offset);
      const query = new URLSearchParams({
        slug,
        from: rangeStart.toISOString(),
        to: rangeEnd.toISOString(),
      });

      const response = await fetch(`/api/availability?${query}`);
      if (!response.ok) throw new Error("Request failed");

      const data = await response.json();
      setSlots(data.slots);
      setWeekOffset(offset);
      setSelected(null);
    } catch {
      setError("Could not load availability. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const days = groupSlotsByDay(slots, timezone);

  const selectedSlot = days
    .flatMap((day) => day.slots.map((slot) => ({ day, slot })))
    .find(({ slot }) => slot.startsAt === selected);

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goToWeek(weekOffset - 1)}
          disabled={weekOffset === 0 || isLoading}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm disabled:opacity-40"
        >
          ← Previous
        </button>

        <span className="text-sm font-medium">
          {weekLabel(timezone, weekOffset)}
        </span>

        <button
          type="button"
          onClick={() => goToWeek(weekOffset + 1)}
          disabled={weekOffset >= MAX_WEEKS_AHEAD || isLoading}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      <p className="mb-6 text-sm text-neutral-500">
        All times shown in {timezone}
      </p>

      {error && (
        <p className="mb-6 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {isLoading && <p className="text-sm text-neutral-500">Loading…</p>}

      {!isLoading && days.length === 0 && (
        <p className="text-sm text-neutral-500">
          No available times this week.
        </p>
      )}

      {!isLoading &&
        days.map((day) => (
          <div key={day.key} className="mb-8">
            <h2 className="mb-3 text-sm font-medium text-neutral-300">
              {day.heading}
            </h2>
            <div className="flex flex-wrap gap-2">
              {day.slots.map((slot) => (
                <button
                  key={slot.startsAt}
                  type="button"
                  aria-pressed={selected === slot.startsAt}
                  onClick={() => setSelected(slot.startsAt)}
                  className={`rounded-md border px-4 py-2 text-sm transition ${
                    selected === slot.startsAt
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-neutral-700 hover:border-neutral-500"
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>
        ))}

      {selectedSlot && (
             
        <BookingForm
          slug={slug}
          startsAt={selectedSlot.slot.startsAt}
          heading={selectedSlot.day.heading}
          time={selectedSlot.slot.label}
        />
      )}
      </section>
    );
}