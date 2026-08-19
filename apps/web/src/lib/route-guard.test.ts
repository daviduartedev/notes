import { describe, expect, it } from "vitest";
import { isProtectedPath, loginRedirect } from "./route-guard";

describe("proteção de rotas", () => {
  it("protege /hoje, /pipeline, /clientes, /projetos e /checklists", () => {
    expect(isProtectedPath("/hoje")).toBe(true);
    expect(isProtectedPath("/pipeline")).toBe(true);
    expect(isProtectedPath("/pipeline/x")).toBe(true);
    expect(isProtectedPath("/clientes")).toBe(true);
    expect(isProtectedPath("/clientes/abc")).toBe(true);
    expect(isProtectedPath("/projetos")).toBe(true);
    expect(isProtectedPath("/checklists")).toBe(true);
    expect(isProtectedPath("/validacoes")).toBe(true);
    expect(isProtectedPath("/validacoes/abc")).toBe(true);
    expect(isProtectedPath("/aprovacoes")).toBe(true);
    expect(isProtectedPath("/aprovacoes/abc")).toBe(true);
    expect(isProtectedPath("/pendencias")).toBe(true);
    expect(isProtectedPath("/pendencias/abc")).toBe(true);
    expect(isProtectedPath("/lembretes")).toBe(true);
    expect(isProtectedPath("/lembretes/abc")).toBe(true);
    expect(isProtectedPath("/reunioes")).toBe(true);
    expect(isProtectedPath("/reunioes/abc")).toBe(true);
    expect(isProtectedPath("/workflows")).toBe(true);
    expect(isProtectedPath("/workflows/abc")).toBe(true);
    expect(isProtectedPath("/login")).toBe(false);
  });

  it("redireciona visitante de /hoje para /login", () => {
    expect(loginRedirect("/hoje", false)).toBe("/login");
  });

  it("redireciona visitante de /pipeline para /login", () => {
    expect(loginRedirect("/pipeline", false)).toBe("/login");
  });

  it("redireciona visitante de /clientes para /login", () => {
    expect(loginRedirect("/clientes", false)).toBe("/login");
  });

  it("redireciona visitante de /checklists para /login", () => {
    expect(loginRedirect("/checklists", false)).toBe("/login");
  });

  it("redireciona visitante de /validacoes para /login", () => {
    expect(loginRedirect("/validacoes", false)).toBe("/login");
  });

  it("redireciona visitante de /aprovacoes para /login", () => {
    expect(loginRedirect("/aprovacoes", false)).toBe("/login");
  });

  it("redireciona visitante de /pendencias para /login", () => {
    expect(loginRedirect("/pendencias", false)).toBe("/login");
  });

  it("redireciona visitante de /lembretes para /login", () => {
    expect(loginRedirect("/lembretes", false)).toBe("/login");
  });

  it("redireciona visitante de /reunioes para /login", () => {
    expect(loginRedirect("/reunioes", false)).toBe("/login");
  });

  it("redireciona visitante de /workflows para /login", () => {
    expect(loginRedirect("/workflows", false)).toBe("/login");
  });

  it("não redireciona visitante em /login", () => {
    expect(loginRedirect("/login", false)).toBeNull();
  });

  it("leva sessão válida de /login para /hoje", () => {
    expect(loginRedirect("/login", true)).toBe("/hoje");
  });
});
