# ORCHESTRATOR

Mandato desta execução (18/08/2026). Cycle Agents devem seguir isto **e** o Harness SDD.

## Fonte de verdade

1. `cycles/Q32026/<slug>/request.md` + artefatos do cycle
2. `spec/` (após C0)
3. `C:\Users\weban\.cursor\commands\` (fluxo SDD)
4. Este diretório (`CURRENT_STATE`, `DECISIONS`, `DEFERRED_CONFIG`)
5. Código no disco — nunca inventar o que o cycle anterior não entregou

## Por cycle

1. Refine: `plan.md`, `tasks.md`, `scenarios.feature`, `spec-delta.md`, `implementation-notes.md`. **Não perguntar ao humano.** Resolver NON-BLOCKING com default coerente; DEFERRED_CONFIG em placeholder; só parar em BLOCKING real.
2. Execute o `tasks.md` (Large: todas as stages em ordem, uma de cada vez, com `stage-summaries/stage-N.md`).
3. Review → `review.md`. Corrigir blockers.
4. Validate → gates reais → `validation.md`. Sem Playwright E2E.
5. Update-spec: promover só o entregue.
6. Close: `CLOSURE.md`.
7. Atualizar `docs/execution/*`.
8. Commit `cycle(NN): …` + push `main` (se auth Git funcionar).

## Gates

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`

Portas: web **3015**, api **3014**. Health na API.

## Proibido

- Generic repository, event sourcing, BPM, microserviços extras
- `workspaceId` no body
- Secrets no git
- Playwright/Cypress E2E nesta execução
- Scope creep / cycle seguinte
- `any` injustificado
- Marcar task done sem evidência
