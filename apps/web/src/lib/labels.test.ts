import { describe, expect, it } from "vitest";
import { stageKeyLabel, stageStatusLabel, validationStatusLabel, approvalStatusLabel, WAITING_ON_CLIENT_COPY } from "./labels";

describe("labels de etapas", () => {
  it("usa a linguagem manuscrita do seed SaaS", () => {
    expect(stageKeyLabel.waiting_client).toBe("Aguardando cliente");
    expect(stageKeyLabel.design_handoff).toBe("Handoff design");
    expect(stageStatusLabel.blocked).toBe("Bloqueada");
    expect(stageStatusLabel.waiting).toBe("Aguardando");
    expect(validationStatusLabel.changes_requested).toBe("Ajustes solicitados");
    expect(approvalStatusLabel.granted).toBe("Concedida");
    expect(WAITING_ON_CLIENT_COPY).toBe("Aguardando cliente");
  });
});
