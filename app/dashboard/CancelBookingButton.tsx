"use client";

import { useState, useTransition } from "react";
import { cancelBooking } from "./actions";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);

    startTransition(async () => {
      try {
        const result = await cancelBooking(bookingId);
        if (!result.ok) {
          setConfirming(false);
          setError(
            "This booking couldn't be cancelled — it may have already started or been cancelled.",
          );
        }
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="mt-5 text-sm">
      {confirming ? (
        <div className="rounded-md border border-red-900 bg-red-950/30 p-4">
          <p>
            Cancel this booking? The client will be emailed, and you&apos;ll
            need to refund them in Stripe.
          </p>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white disabled:opacity-50"
            >
              {isPending ? "Cancelling…" : "Yes, cancel"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={isPending}
              className="rounded-md border border-neutral-700 px-3 py-1.5 disabled:opacity-50"
            >
              Keep booking
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-red-400 underline"
        >
          Cancel booking
        </button>
      )}

      {error && (
        <p className="mt-2 text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}