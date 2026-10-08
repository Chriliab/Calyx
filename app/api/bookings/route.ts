import { NextResponse } from "next/server";
import { bookingInputSchema } from "@/lib/validation";
import { createPendingBooking } from "@/server/bookings";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = bookingInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const result = await createPendingBooking(parsed.data);

  if (!result.ok) {
    return result.reason === "NOT_FOUND"
      ? NextResponse.json({ error: "Not found" }, { status: 404 })
      : NextResponse.json(
          { error: "That time is no longer available." },
          { status: 409 },
        );
  }

  return NextResponse.json({ bookingId: result.bookingId }, { status: 201 });
}