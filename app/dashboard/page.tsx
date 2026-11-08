import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { getConsultantForUser } from "@/server/consultants";

export default async function DashboardPage() {
  // Second gate: never rely on the proxy alone.
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const consultant = await getConsultantForUser(userId);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-10 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <UserButton />
      </header>

      {consultant ? (
        <section>
          <p className="text-lg">Signed in as {consultant.name}</p>
          <p className="mt-2 text-sm text-neutral-400">
            Your booking page:{" "}
            <Link
              href={`/book/${consultant.slug}`}
              className="text-blue-400 underline"
            >
              /book/{consultant.slug}
            </Link>
          </p>
        </section>
      ) : (
        <p className="text-neutral-400">
          Your account isn&apos;t linked to a consultant profile yet.
        </p>
      )}
    </main>
  );
}