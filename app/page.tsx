import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/landing/Hero";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
      </main>
    </div>
  );
}