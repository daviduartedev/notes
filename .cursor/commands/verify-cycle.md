---
description: Skeptical, independent verification that each scenario has REAL automated evidence
---

# Verify cycle

Adversarial check run **before** `/close-cycle`. Its only job: prove that the cycle's claimed completion is real — not that the implementing agent *said* it was done.

> This command exists because coding agents are documented to mark "verify implementation" tasks complete without writing the tests — producing manual-testing instructions instead. `verify-cycle` does not trust self-reports. It re-checks the evidence directly.

## Mindset

Assume nothing is done until proven. Treat `tasks.md` checkmarks and `validation.md` claims as **unverified assertions** to be falsified. For best results, run this with fresh context (new session) or delegate to a separate reviewer agent, so it does not inherit the implementer's assumptions.

## Prerequisites

Read:

- `request.md`, `plan.md`, `tasks.md`, `scenarios.feature`
- `spec-delta.md`, `implementation-notes.md`, `validation.md` (if exist)
- `.cursor/rules/ai-agent.md`

## Instructions

1. For **each** scenario in `scenarios.feature`, locate the actual automated test that exercises it. Open the test file and confirm:
   - the test exists in code (not just described in prose),
   - it asserts the scenario's observable outcome (not a placeholder/`expect(true)`),
   - it is wired into the suite that `/validate-cycle` runs (not skipped/`.skip`/`.todo`).
2. Re-run the gates yourself (`lint`, `typecheck`, `test`, `build`) and capture exit codes — do not trust the recorded results in `validation.md`. Compare your results to what was claimed.
3. For each task marked complete in `tasks.md`, find concrete evidence (changed file, test, command output). Flag any "complete" task whose only evidence is a manual instruction.
4. Check for silent contradictions with `spec/` and `spec/decisions.md` (if it exists): did the implementation reverse a prior decision without an ADR?

## Output

```txt
Verification verdict: PASS | FAIL | PASS WITH GAPS

Scenario coverage:
| Cenário | Teste encontrado | Asserção real? | No suite? | Status |
|---------|------------------|----------------|-----------|--------|

Gate re-run (my results vs. claimed):
| Gate | Meu resultado | Claimed | Match? |
|------|---------------|---------|--------|

Unsupported completions:
- <task marcada done sem evidência automatizada>

Silent contradictions:
- <implementação que contradiz spec/decisions sem ADR>

Verdict rationale:
...
```

## Do not

- Marcar como verificado qualquer cenário sem abrir o teste real.
- Confiar nos resultados gravados em `validation.md` sem re-rodar.
- Alterar código (a menos que o humano peça) — este comando audita, não conserta.
- Permitir `/close-cycle` se o veredito for FAIL com lacunas críticas não documentadas.
