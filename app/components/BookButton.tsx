'use client';

export default function BookButton() {
  return (
    <button
      className="rounded bg-blue-600 px-4 py-2 text-white"
      onClick={() => alert("clicked")}
    >
      Book a call
    </button>
  );
}