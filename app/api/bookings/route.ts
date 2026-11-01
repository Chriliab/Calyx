import { NextResponse } from "next/server";
import { bookingInputSchema } from "@/lib/validation";
import { createPendingBooking } from "@/server/bookings";
import {createCheckoutSession} from "@/server/payments";
import { checkBookingRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {

    const rateLimit = await checkBookingRateLimit(getClientIp(request));

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many booking attempts. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

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

    const checkout = await createCheckoutSession(result.bookingId);

  if (!checkout.ok) {
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: checkout.url }, { status: 201 });
}
