import { LogoutButton } from "@/components/logout-button";

export default function HojePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between border-b border-notes-border pb-4">
        <h1 className="font-display text-4xl">Notes</h1>
        <LogoutButton />
      </header>
      <section className="rounded-lg border border-dashed border-notes-border bg-notes-panel p-8">
        <h2 className="font-display text-2xl">Hoje</h2>
        <p className="mt-2 text-notes-muted">quadro ainda sem operação</p>
      </section>
    </main>
  );
}
