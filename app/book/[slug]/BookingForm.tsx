"use client";

import { useState } from "react";
import {
  BUDGET_RANGES,
  TIMELINES,
  bookingInputSchema,
} from "@/lib/validation";

type Props = {
  slug: string;
  startsAt: string;
  heading: string;
  time: string;
};

type FieldErrors = Partial<Record<string, string[]>>;

export function BookingForm({ slug, startsAt, heading, time }: Props) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const form = new FormData(event.currentTarget);
    const candidate = {
      slug,
      startsAt,
      name: form.get("name"),
      email: form.get("email"),
      projectDescription: form.get("projectDescription"),
      budgetRange: form.get("budgetRange"),
      timeline: form.get("timeline"),
    };

    const parsed = bookingInputSchema.safeParse(candidate);

    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (response.status === 409) {
        setFormError("That time was just booked. Please pick another slot.");
        return;
      }

      if (!response.ok) throw new Error("Request failed");

      setDone(true);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mt-10 rounded-lg border border-green-800 bg-green-950/30 p-5">
        <p className="font-medium">Request received</p>
        <p className="mt-1 text-sm text-neutral-400">
          {heading} at {time}. Payment comes next — that step is not built yet.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-5">
      <div className="rounded-lg border border-neutral-700 p-4">
        <p className="text-sm text-neutral-400">Selected</p>
        <p className="mt-1 font-medium">
          {heading} at {time}
        </p>
      </div>

      <Field label="Your name" error={errors.name}>
        <input
          name="name"
          type="text"
          maxLength={100}
          required
          className="w-full rounded-md border border-neutral-700 bg-transparent px-3 py-2"
        />
      </Field>

      <Field label="Email" error={errors.email}>
        <input
          name="email"
          type="email"
          maxLength={254}
          required
          className="w-full rounded-md border border-neutral-700 bg-transparent px-3 py-2"
        />
      </Field>

      <Field label="What's the project?" error={errors.projectDescription}>
        <textarea
          name="projectDescription"
          rows={4}
          maxLength={2000}
          required
          className="w-full rounded-md border border-neutral-700 bg-transparent px-3 py-2"
        />
      </Field>

      <Field label="Budget range" error={errors.budgetRange}>
        <select
          name="budgetRange"
          required
          defaultValue=""
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
        >
          <option value="" disabled>
            Select…
          </option>
          {BUDGET_RANGES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Timeline" error={errors.timeline}>
        <select
          name="timeline"
          required
          defaultValue=""
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
        >
          <option value="" disabled>
            Select…
          </option>
          {TIMELINES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </Field>

      {formError && (
        <p className="text-sm text-red-400" role="alert">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white disabled:opacity-50"
      >
        {isSubmitting ? "Submitting…" : "Request this time"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-neutral-300">{label}</span>
      {children}
      {error && (
        <span className="mt-1 block text-sm text-red-400">{error[0]}</span>
      )}
    </label>
  );
}