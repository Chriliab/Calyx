import { prisma } from "@/lib/prisma";
import BookButton from "./components/BookButton";

export default async function Home() {
  const consultants = await prisma.consultant.findMany();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Calyx</h1>
      <p className="text-lg">Booking made simple for freelance consultants.</p>

      <p className="text-sm text-gray-400">
        {consultants.length} consultant(s) in the database
      </p>

      <BookButton />
    </main>
  );
}