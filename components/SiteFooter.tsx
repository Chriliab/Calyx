import Link from "next/link";

const REPO_URL = "https://github.com/Chriliab/Calyx";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-semibold text-ink">Calyx</span> · A portfolio
          project by Chris Liampas
        </p>

        <nav aria-label="Footer" className="flex gap-6">
          <a href={REPO_URL} className="transition-colors hover:text-ink">
            Source on GitHub
          </a>
          <Link href="/sign-in" className="transition-colors hover:text-ink">
            Consultant sign-in
          </Link>
        </nav>
      </div>
    </footer>
  );
}