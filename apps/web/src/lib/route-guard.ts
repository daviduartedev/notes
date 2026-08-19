export function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/hoje" ||
    pathname.startsWith("/hoje/") ||
    pathname === "/pipeline" ||
    pathname.startsWith("/pipeline/") ||
    pathname === "/clientes" ||
    pathname.startsWith("/clientes/") ||
    pathname === "/projetos" ||
    pathname.startsWith("/projetos/") ||
    pathname === "/checklists" ||
    pathname.startsWith("/checklists/") ||
    pathname === "/validacoes" ||
    pathname.startsWith("/validacoes/") ||
    pathname === "/aprovacoes" ||
    pathname.startsWith("/aprovacoes/") ||
    pathname === "/pendencias" ||
    pathname.startsWith("/pendencias/") ||
    pathname === "/lembretes" ||
    pathname.startsWith("/lembretes/") ||
    pathname === "/reunioes" ||
    pathname.startsWith("/reunioes/") ||
    pathname === "/workflows" ||
    pathname.startsWith("/workflows/")
  );
}

export function loginRedirect(
  pathname: string,
  hasSession: boolean,
): string | null {
  if (!hasSession && isProtectedPath(pathname)) {
    return "/login";
  }
  if (hasSession && pathname === "/login") {
    return "/hoje";
  }
  return null;
}
