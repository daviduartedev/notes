import type { ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";

const links = [
  { href: "/hoje", label: "Hoje" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/clientes", label: "Clientes" },
  { href: "/projetos", label: "Projetos" },
  { href: "/checklists", label: "Checklists" },
  { href: "/validacoes", label: "Validações" },
  { href: "/aprovacoes", label: "Aprovações" },
  { href: "/pendencias", label: "Pendências" },
  { href: "/lembretes", label: "Lembretes" },
  { href: "/reunioes", label: "Reuniões" },
];

export function AppShell({
  title,
  pathname,
  children,
}: {
  title: string;
  pathname: string;
  children: ReactNode;
}) {
  const wide = pathname === "/pipeline" || pathname.startsWith("/pipeline/");
  return (
    <main
      className={`mx-auto flex min-h-screen flex-col gap-6 px-6 py-10 ${wide ? "max-w-none" : "max-w-5xl"}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-notes-border pb-4">
        <div className="flex flex-wrap items-center gap-6">
          <h1 className="font-display text-4xl">Notes</h1>
          <nav className="flex gap-3 text-sm">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "text-semantic-blue"
                      : "text-notes-muted hover:text-notes-text"
                  }
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>
        <LogoutButton />
      </header>
      <h2 className="font-display text-2xl">{title}</h2>
      {children}
    </main>
  );
}
