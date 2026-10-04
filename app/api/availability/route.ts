import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublicAvailability } from "@/server/availability";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Invalid slug"),
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsed = querySchema.safeParse({
    slug: searchParams.get("slug"),
    from: searchParams.get("from"),
    to: searchParams.get("to"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const availability = await getPublicAvailability({
    slug: parsed.data.slug,
    rangeStart: parsed.data.from,
    rangeEnd: parsed.data.to,
  });

  if (!availability) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    consultant: availability.consultant,
    sessionType: availability.sessionType,
    slots: availability.slots.map((slot) => ({
      startsAt: slot.startsAt.toISOString(),
      endsAt: slot.endsAt.toISOString(),
    })),
  });
}