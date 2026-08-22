import { BrandMark } from "@/components/brand-mark";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      <section className="hidden w-[42%] flex-col justify-between border-r border-notes-border bg-notes-panel px-10 py-10 md:flex">
        <BrandMark className="text-notes-text" />
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-notes-ink">Delivery OS</p>
          <h1 className="mt-3 max-w-sm text-3xl font-semibold tracking-tight">
            O quadro operacional da software house.
          </h1>
          <p className="mt-4 max-w-sm text-sm text-notes-muted">
            Projeto no centro. Etapas, validações, aprovações e o que precisa acontecer hoje — num único workspace.
          </p>
        </div>
        <p className="text-xs text-notes-muted">Notes · workspace interno</p>
      </section>
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm border border-notes-border bg-notes-panel p-8">
          <div className="mb-8 md:hidden">
            <BrandMark />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Entrar</h2>
          <p className="mt-1 text-sm text-notes-muted">Use as credenciais do workspace.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
