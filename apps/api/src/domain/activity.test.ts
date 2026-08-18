import { describe, expect, it } from "vitest";
import { sanitizeActivityPayload } from "./activity";

describe("payload de activity", () => {
  it("remove telefone e e-mail", () => {
    expect(
      sanitizeActivityPayload({
        name: "Acme",
        email: "a@b.com",
        whatsapp: "11999999999",
        status: "lead",
      }),
    ).toEqual({ name: "Acme", status: "lead" });
  });

  it("remove chaves aninhadas de PII", () => {
    expect(
      sanitizeActivityPayload({
        fields: ["name"],
        nested: { email: "x@y.com", ok: 1 },
      }),
    ).toEqual({ fields: ["name"], nested: { ok: 1 } });
  });
});
