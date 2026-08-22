import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { LogoutButton } from "@/components/logout-button";

const links = [
  { href: "/hoje", label: "Dashboard" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/clientes", label: "Clientes" },
  { href: "/projetos", label: "Projetos" },
  { href: "/workflows", label: "Workflows" },
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
  const wide = pathname === "/pipeline" || pathname.startsWith("/pipeline/") || pathname === "/hoje";
  return (
    <div className="flex min-h-screen flex-col bg-notes-canvas">
      <header className="sticky top-0 z-20 flex h-12 items-center gap-5 border-b border-notes-border bg-notes-canvas px-6">
        <a href="/hoje" className="flex-none text-notes-text">
          <BrandMark />
        </a>
        <div className="h-4 w-px flex-none bg-notes-border" />
        <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <a
                key={link.href}
                href={link.href}
                className={active ? "nav-item nav-item-active" : "nav-item"}
              >
                {link.label}
              </a>
            );
          })}
        </nav>
        <LogoutButton />
      </header>
      <main className={wide ? "flex flex-1 flex-col" : "page-shell"}>
        <h2 className={`font-semibold tracking-tight ${wide ? "px-8 pt-5 text-[20px]" : "text-[20px]"}`}>
          {title}
        </h2>
        {children}
      </main>
    </div>
  );
}
