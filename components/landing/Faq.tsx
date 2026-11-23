const FAQS = [
  {
    question: "Do I need an account to book a call?",
    answer: "No. You book as a guest with your name and email. Only consultants sign in.",
  },
  {
    question: "Which time zone are the times in?",
    answer: "The consultant's. The booking page shows which time zone that is, so you can convert it to yours.",
  },
  {
    question: "How do I pay, and is it safe?",
    answer: "By card, on Stripe's secure checkout page. Apple Pay and Google Pay work too, where your device supports them. Your card details go to Stripe only; Calyx never sees or stores them.",
  },
  {
    question: "When is my booking confirmed?",
    answer: "As soon as Stripe confirms your payment, usually within seconds, and you get a confirmation email. If you leave the payment page without paying, the slot is released after 30 minutes.",
  },
  {
    question: "Who sees the project details I share?",
    answer: "The consultant you're booking with, in their confirmation email and their dashboard, so they can prepare for the call. They're never shown publicly.",
  },
  {
    question: "Can I cancel or reschedule?",
    answer: "Reply to your confirmation email and your message goes straight to the consultant. If they cancel your booking, you get an email and they arrange your refund.",
  },
  {
    question: "Is the demo a real booking?",
    answer: "Partly. It holds a real slot and sends a real confirmation email, but payments run in Stripe test mode, so no money moves. Pay with card 4242 4242 4242 4242, any future expiry and any CVC.",
  },
  {
    question: "How do I get a consultant account?",
    answer: "Consultant accounts are invite-only for now.",
  },
] as const;

export function Faq() {
  return (
    <section
      id="questions"
      aria-labelledby="questions-title"
      className="scroll-mt-8 border-t border-line"
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-20">
        <h2
          id="questions-title"
          className="text-3xl font-semibold tracking-tight text-ink"
        >
          Questions
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          How booking works, from the client&apos;s side.
        </p>

        <div className="mt-10 max-w-3xl divide-y divide-line border-y border-line">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-medium text-ink [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="text-xl leading-none text-muted transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-muted">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}