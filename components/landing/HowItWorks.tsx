const STEPS = [
  {
    title: "Pick a time",
    body: "Your client opens your booking link and chooses an open slot. Times come from your weekly hours, and a slot can never be booked twice.",
  },
  {
    title: "Share the project",
    body: "Before paying, they describe the project, their budget range and their timeline, so you know what the call is about.",
  },
  {
    title: "Pay and confirm",
    body: "They pay by card through Stripe. Once Stripe confirms the payment, you both get an email, and the booking appears in your dashboard with their answers.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="scroll-mt-8 border-t border-line"
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-20">
        <h2
          id="how-it-works-title"
          className="text-3xl font-semibold tracking-tight text-ink"
        >
          How it works
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          Three steps for your client, all before the call.
        </p>

        <ol role="list" className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-lg border border-line bg-surface p-6"
            >
              <span aria-hidden="true" className="font-serif text-3xl italic text-accent">
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}