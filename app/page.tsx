import BookButton from "./components/BookButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Calyx</h1>
      <p className="text-lg">Booking made simple for freelance consultants.</p>
      <BookButton />
    </main>
  );
}