import { DateTime } from "luxon";

export type AvailabilityRule = {
  dayOfWeek: number; // 0 = Sunday … 6 = Saturday
  startMinute: number; // wall clock, minutes from midnight
  endMinute: number;
};

export type Interval = {
  startsAt: Date; // UTC instant
  endsAt: Date;
};

export type GenerateSlotsOptions = {
  rules: AvailabilityRule[];
  timezone: string; // IANA, e.g. "Europe/Athens"
  durationMinutes: number;
  busy: Interval[]; // existing non-cancelled bookings
  rangeStart: Date;
  rangeEnd: Date;
  now?: Date;
  stepMinutes?: number; // defaults to durationMinutes (back-to-back slots)
};

/** Standard interval-overlap test — the same one the booking transaction uses. */
function overlaps(a: Interval, b: Interval): boolean {
  return a.startsAt < b.endsAt && a.endsAt > b.startsAt;
}

/** A wall-clock minute on a given local day → a real UTC instant. */
function wallClockToUtc(day: DateTime, minuteOfDay: number): Date | null {
  const dayOffset = Math.floor(minuteOfDay / 1440);
  const minute = minuteOfDay % 1440;
  const target = dayOffset === 0 ? day : day.plus({ days: dayOffset });

  const local = DateTime.fromObject(
    {
      year: target.year,
      month: target.month,
      day: target.day,
      hour: Math.floor(minute / 60),
      minute: minute % 60,
    },
    { zone: target.zone },
  );

  return local.isValid ? local.toUTC().toJSDate() : null;
}

/** Start minutes that fit a full session inside this rule's window. */
function slotStartMinutes(
  rule: AvailabilityRule,
  durationMinutes: number,
  stepMinutes: number,
): number[] {
  const starts: number[] = [];
  for (
    let minute = rule.startMinute;
    minute + durationMinutes <= rule.endMinute;
    minute += stepMinutes
  ) {
    starts.push(minute);
  }
  return starts;
}
export function generateSlots(options: GenerateSlotsOptions): Interval[] {
  const { rules, timezone, durationMinutes, busy, rangeStart, rangeEnd } = options;
  const step = options.stepMinutes ?? durationMinutes;
  const now = options.now ?? new Date();

  if (durationMinutes <= 0 || step <= 0) return [];

  const firstDay = DateTime.fromJSDate(rangeStart, { zone: timezone }).startOf("day");
  const lastDay = DateTime.fromJSDate(rangeEnd, { zone: timezone }).startOf("day");
  if (!firstDay.isValid || !lastDay.isValid) return []; // unknown timezone

  const slots: Interval[] = [];

  for (
    let day = firstDay;
    day.toMillis() <= lastDay.toMillis();
    day = day.plus({ days: 1 })
  ) {
    const dayOfWeek = day.weekday % 7; // Luxon: 1 = Mon … 7 = Sun → 0 = Sun … 6 = Sat

    for (const rule of rules.filter((r) => r.dayOfWeek === dayOfWeek)) {
      for (const minute of slotStartMinutes(rule, durationMinutes, step)) {
        const startsAt = wallClockToUtc(day, minute);
        if (!startsAt) continue; // skipped hour at a DST transition

        const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);
        const slot = { startsAt, endsAt };

        if (startsAt < rangeStart || startsAt >= rangeEnd) continue;
        if (startsAt <= now) continue;
        if (busy.some((b) => overlaps(slot, b))) continue;

        slots.push(slot);
      }
    }
  }

  return slots.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

import { prisma } from "@/lib/prisma";
