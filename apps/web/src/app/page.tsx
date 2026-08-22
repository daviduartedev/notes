import { BrandMark } from "@/components/brand-mark";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-6">
      <BrandMark className="text-notes-text" />
      <p className="text-sm text-notes-muted">Quadro operacional da software house.</p>
      <a className="text-sm text-notes-ink" href="/login">
        Entrar
      </a>
    </main>
  );
}
