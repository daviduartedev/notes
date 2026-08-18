export function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/hoje" ||
    pathname.startsWith("/hoje/") ||
    pathname === "/clientes" ||
    pathname.startsWith("/clientes/") ||
    pathname === "/projetos" ||
    pathname.startsWith("/projetos/")
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
