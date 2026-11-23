import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#questions", label: "Questions" },
] as const;

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold text-ink">
        <img src="/calyx-mark.svg" alt="" width={32} height={32} />
        Calyx
      </Link>

      <div className="flex items-center gap-6">
        <nav
          aria-label="Main"
          className="hidden items-center gap-6 text-sm font-medium text-muted sm:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}