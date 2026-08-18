import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 px-6">
      <h1 className="font-display text-5xl text-notes-text">Notes</h1>
      <p className="text-notes-muted">Quadro operacional da software house.</p>
      <Link className="text-semantic-blue underline" href="/login">
        Entrar
      </Link>
    </main>
  );
}
