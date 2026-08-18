import { describe, expect, it } from "vitest";
import { isProtectedPath, loginRedirect } from "./route-guard";

describe("proteção de rotas", () => {
  it("protege /hoje", () => {
    expect(isProtectedPath("/hoje")).toBe(true);
    expect(isProtectedPath("/login")).toBe(false);
  });

  it("redireciona visitante de /hoje para /login", () => {
    expect(loginRedirect("/hoje", false)).toBe("/login");
  });

  it("não redireciona visitante em /login", () => {
    expect(loginRedirect("/login", false)).toBeNull();
  });

  it("leva sessão válida de /login para /hoje", () => {
    expect(loginRedirect("/login", true)).toBe("/hoje");
  });
});
