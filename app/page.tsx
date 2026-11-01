import Link from "next/link";

const DEMO_CONSULTANT_SLUG = "chris-l";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-semibold">Calyx</h1>

      <p className="mt-4 text-xl text-neutral-300">
        Booking made simple for freelance consultants.
      </p>
      <p className="mt-2 max-w-md text-sm text-neutral-500">
        Pick a slot, share your project details, and pay — before the call
        happens.
      </p>

      <Link
        href={`/book/${DEMO_CONSULTANT_SLUG}`}
        className="mt-8 rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-500"
      >
        Book a demo call
      </Link>

      <p className="mt-6 text-xs text-neutral-500">
        Demo mode — pay with test card 4242 4242 4242 4242. No real charges.
      </p>
    </main>
  );
}