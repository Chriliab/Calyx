"use client";

import { useSyncExternalStore } from "react";

/** How far down the page (in pixels) before the button appears. */
const SHOW_AFTER_PX = 600;

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function getIsScrolledDown() {
  return window.scrollY > SHOW_AFTER_PX;
}

function getServerIsScrolledDown() {
  return false;
}

function scrollToTop() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });

  // Keyboard users continue from the top too: focus the logo, the first link on the page.
  document.querySelector<HTMLElement>("header a")?.focus({ preventScroll: true });
}

export function BackToTop() {
  const visible = useSyncExternalStore(
    subscribe,
    getIsScrolledDown,
    getServerIsScrolledDown,
  );

  return (
    <button
      type="button"
      onClick={scrollToTop}
      inert={!visible}
      aria-label="Back to top"
      title="Back to top"
      className={`fixed bottom-6 right-6 z-10 grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-ink shadow-lg transition duration-200 hover:text-accent motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <ArrowUpIcon />
    </button>
  );
}

// Arrow icon from Feather (feathericons.com), MIT licence.
function ArrowUpIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}