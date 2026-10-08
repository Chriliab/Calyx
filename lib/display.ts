import { DateTime } from "luxon";

export type SlotDTO = {
  startsAt: string; // ISO UTC
  endsAt: string;
};

export type DayGroup = {
  key: string; // local ISO date, e.g. "2026-10-12"
  heading: string; // "Monday 12 October"
  slots: { startsAt: string; label: string }[];
};
/** The Monday-to-Monday window for a week offset, as UTC instants. */
export function weekRangeUtc(timezone: string, weekOffset: number) {
  const start = DateTime.now()
    .setZone(timezone)
    .startOf("week")
    .plus({ weeks: weekOffset });

  return {
    rangeStart: start.toUTC().toJSDate(),
    rangeEnd: start.plus({ weeks: 1 }).toUTC().toJSDate(),
  };
}

/** Label for the week navigation, e.g. "12 – 18 October". */
export function weekLabel(timezone: string, weekOffset: number): string {
  const start = DateTime.now()
    .setZone(timezone)
    .startOf("week")
    .plus({ weeks: weekOffset });
  const end = start.plus({ days: 6 });

  return start.month === end.month
    ? `${start.toFormat("d")} – ${end.toFormat("d LLLL")}`
    : `${start.toFormat("d LLL")} – ${end.toFormat("d LLL")}`;
}
/** Group UTC slots into local days for display. */
export function groupSlotsByDay(
  slots: SlotDTO[],
  timezone: string,
): DayGroup[] {
  const groups = new Map<string, DayGroup>();

  for (const slot of slots) {
    const local = DateTime.fromISO(slot.startsAt, { zone: timezone });
    const key = local.isValid ? local.toISODate() : null;
    if (!key) continue;

    let group = groups.get(key);
    if (!group) {
      group = { key, heading: local.toFormat("cccc d LLLL"), slots: [] };
      groups.set(key, group);
    }

    group.slots.push({
      startsAt: slot.startsAt,
      label: local.toFormat("HH:mm"),
    });
  }

 return Array.from(groups.values());
}
export function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
  }).format(cents / 100);
}