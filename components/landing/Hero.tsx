import Link from "next/link";
import { DEMO_BOOKING_PATH } from "@/lib/demo";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 pb-20 pt-16 sm:pt-24">
      <p className="text-sm font-medium text-accent">
        Booking for freelance consultants
      </p>

      <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
        Know the project{" "}
        <em className="font-serif text-[1.08em] font-normal text-accent">
          before
        </em>{" "}
        the call.
      </h1>

      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        Clients pick a time, tell you what they need, and pay upfront. Every
        paid call starts with context instead of small talk.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          href={DEMO_BOOKING_PATH}
          className="rounded-md bg-accent px-5 py-3 font-medium text-on-accent transition-colors hover:bg-accent/90"
        >
          Book a demo call
        </Link>
        <a
          href="#how-it-works"
          className="rounded-md border border-line px-5 py-3 font-medium text-ink transition-colors hover:bg-surface"
        >
          See how it works
        </a>
      </div>

      <p className="mt-6 text-sm text-muted">
        The demo runs in Stripe test mode. Pay with card{" "}
        <span className="whitespace-nowrap font-mono text-ink">
          4242 4242 4242 4242
        </span>
        , any future expiry and any CVC.
      </p>
    </section>
  );
}