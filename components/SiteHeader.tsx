import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold text-ink">
        <img src="/calyx-mark.svg" alt="" width={32} height={32} />
        Calyx
      </Link>
      <ThemeToggle />
    </header>
  );
}