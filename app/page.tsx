import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

const DEMO_CONSULTANT_SLUG = "chris-l";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl font-semibold">Calyx</h1>
        <p className="mt-4 text-xl text-muted">
          Booking made simple for freelance consultants.
        </p>
        <Link
          href={`/book/${DEMO_CONSULTANT_SLUG}`}
          className="mt-8 rounded-md bg-accent px-5 py-2.5 font-medium text-on-accent hover:bg-accent/90"
        >
          Book a demo call
        </Link>
        <p className="mt-6 text-xs text-muted">
          Demo mode — pay with test card 4242 4242 4242 4242. No real charges.
        </p>
      </main>
    </div>
  );
}