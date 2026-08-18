import { describe, expect, it } from "vitest";
import { isProtectedPath, loginRedirect } from "./route-guard";

describe("proteção de rotas", () => {
  it("protege /hoje, /clientes e /projetos", () => {
    expect(isProtectedPath("/hoje")).toBe(true);
    expect(isProtectedPath("/clientes")).toBe(true);
    expect(isProtectedPath("/clientes/abc")).toBe(true);
    expect(isProtectedPath("/projetos")).toBe(true);
    expect(isProtectedPath("/login")).toBe(false);
  });

  it("redireciona visitante de /hoje para /login", () => {
    expect(loginRedirect("/hoje", false)).toBe("/login");
  });

  it("redireciona visitante de /clientes para /login", () => {
    expect(loginRedirect("/clientes", false)).toBe("/login");
  });

  it("não redireciona visitante em /login", () => {
    expect(loginRedirect("/login", false)).toBeNull();
  });

  it("leva sessão válida de /login para /hoje", () => {
    expect(loginRedirect("/login", true)).toBe("/hoje");
  });
});
