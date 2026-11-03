import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

import { DateTime } from "luxon";
import { resend, EMAIL_FROM } from "@/lib/email";
import {
  clientConfirmationEmail,
  consultantNotificationEmail,
}from "@/lib/emails/booking-confirmed";


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
  if (!baseUrl) {
    await releaseBooking(booking.id);
    return { ok: false, reason: "STRIPE_ERROR" };
  }

  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      allowed_payment_method_types: ["card"],
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
  } catch (error) {
    // No session exists, so nobody can pay — safe to free the slot now.
    console.error("Stripe checkout session failed", error);
    await releaseBooking(booking.id);
    return { ok: false, reason: "STRIPE_ERROR" };
  }

  if (!session.url) {
    await releaseBooking(booking.id);
    return { ok: false, reason: "STRIPE_ERROR" };
  }

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
}

/** Free the slot held by a booking that will never reach payment. */
async function releaseBooking(bookingId: string): Promise<void> {
  await prisma.booking.updateMany({
    where: { id: bookingId, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
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

  const [, bookingUpdate]=await prisma.$transaction([
    prisma.payment.updateMany({
      where: { stripeSessionId: session.id, status: "PENDING" },
      data: { status: "SUCCEEDED", stripePaymentIntentId: paymentIntentId },
    }),
    prisma.booking.updateMany({
      where: { id: bookingId, status: "PENDING" },
      data: { status: "CONFIRMED" },
    }),
  ]);
  if (bookingUpdate.count === 0) return;

    await sendBookingEmails(bookingId);
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

async function sendBookingEmails(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      startsAt: true,
      projectDescription: true,
      budgetRange: true,
      timeline: true,
      consultant: { select: { name: true, email: true, timezone: true } },
      sessionType: { select: { title: true } },
      client: { select: { name: true, email: true } },
    },
  });

  if (!booking) return;

  const when = DateTime.fromJSDate(booking.startsAt, {
    zone: booking.consultant.timezone,
  }).toFormat("cccc d LLLL yyyy 'at' HH:mm");

  const shared = {
    consultantName: booking.consultant.name,
    clientName: booking.client.name,
    sessionTitle: booking.sessionType.title,
    when,
    timezone: booking.consultant.timezone,
  };

  const clientEmail = clientConfirmationEmail(shared);
  const consultantEmail = consultantNotificationEmail({
    ...shared,
    clientEmail: booking.client.email,
    projectDescription: booking.projectDescription,
    budgetRange: booking.budgetRange,
    timeline: booking.timeline,
  });

  const results = await Promise.allSettled([
    resend.emails.send({
      from: EMAIL_FROM,
      to: booking.client.email,
      replyTo: booking.consultant.email,
      subject: clientEmail.subject,
      html: clientEmail.html,
      text: clientEmail.text,
    }),
    resend.emails.send({
      from: EMAIL_FROM,
      to: booking.consultant.email,
      replyTo: booking.client.email,  
      subject: consultantEmail.subject,
      html: consultantEmail.html,
      text: consultantEmail.text,
    }),
  ]);

  const labels = ["client", "consultant"] as const;

  results.forEach((result, index) => {
    const recipient = labels[index];

    if (result.status === "rejected") {
      console.error(`Booking email failed (${recipient})`, bookingId, result.reason);
    } else if (result.value.error) {
      console.error(`Booking email rejected (${recipient})`, bookingId, result.value.error);
    }
  });
}