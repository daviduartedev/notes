import { describe, expect, it } from "vitest";
import { HOJE_EMPTY_STATE } from "./hoje-copy";

describe("empty state /hoje", () => {
  it("usa a copy do quadro vazio", () => {
    expect(HOJE_EMPTY_STATE).toBe("quadro ainda sem operação");
  });
});
