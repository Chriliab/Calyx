import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; reason: "NOT_FOUND" | "ALREADY_PAID" | "STRIPE_ERROR" };

export async function createCheckoutSession(
  bookingId: string,
): Promise<CheckoutResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      status: true,
      startsAt: true,
      priceAtBooking: true,
      currencyAtBooking: true,
      consultant: { select: { name: true, slug: true } },
      sessionType: { select: { title: true } },
      client: { select: { email: true } },
      payment: { select: { id: true } },
    },
  });

  if (!booking) return { ok: false, reason: "NOT_FOUND" };
  if (booking.status !== "PENDING") return { ok: false, reason: "ALREADY_PAID" };
  if (booking.payment) return { ok: false, reason: "ALREADY_PAID" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) return { ok: false, reason: "STRIPE_ERROR" };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: booking.client.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: booking.currencyAtBooking.toLowerCase(),
            unit_amount: booking.priceAtBooking,
            product_data: {
              name: `${booking.sessionType.title} with ${booking.consultant.name}`,
            },
          },
        },
      ],
      metadata: { bookingId: booking.id },
      success_url: `${baseUrl}/book/${booking.consultant.slug}/success?booking=${booking.id}`,
      cancel_url: `${baseUrl}/book/${booking.consultant.slug}?cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    if (!session.url) return { ok: false, reason: "STRIPE_ERROR" };

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        stripeSessionId: session.id,
        amountCents: booking.priceAtBooking,
        currency: booking.currencyAtBooking,
        status: "PENDING",
      },
    });

    return { ok: true, url: session.url };
  } catch (error) {
    console.error("Stripe checkout session failed", error);
    return { ok: false, reason: "STRIPE_ERROR" };
  }
}
/**
 * Confirm a booking from a verified checkout.session.completed event.
 * Safe to run more than once — Stripe retries and may redeliver.
 */
export async function confirmBookingPayment(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    console.error("Checkout session has no bookingId", session.id);
    return;
  }

  if (session.payment_status !== "paid") return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: { stripeSessionId: session.id, status: "PENDING" },
      data: { status: "SUCCEEDED", stripePaymentIntentId: paymentIntentId },
    }),
    prisma.booking.updateMany({
      where: { id: bookingId, status: "PENDING" },
      data: { status: "CONFIRMED" },
    }),
  ]);
}

/**
 * Release a slot when its checkout session expires unpaid.
 */
export async function expireBookingPayment(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return;

  await prisma.$transaction([
    prisma.payment.updateMany({
      where: { stripeSessionId: session.id, status: "PENDING" },
      data: { status: "FAILED" },
    }),
    prisma.booking.updateMany({
      where: { id: bookingId, status: "PENDING" },
      data: { status: "CANCELLED" },
    }),
  ]);
}