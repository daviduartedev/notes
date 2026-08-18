# CYCLE_HISTORY

Ordem de execução (ORCH-011): **C0 → C1 → C2 → C3 → C4 → C5 → C6 → C7 → C8 → C9 → C10 → C11**.

| Cycle | Status | Objetivo | Implementado | Testes | Commit | Observações |
|---|---|---|---|---|---|---|
| C0 foundation | done | Repo, harness, CI, shell, auth, workspace, `/hoje` vazio | sim | lint/typecheck/test/build 0 | `7d99a98` + harden `173781e` | Verify PASS; Postgres local :5433 |
| C1 clientes-e-projetos | done | Clientes, projetos, activity log | sim | lint/typecheck/test/build 0 | `ee9461d` | Sem Playwright; overdue no DTO |
| C2 etapas-e-transicoes | done | Template SaaS, stages, transições | sim | lint/typecheck/test/build 0 | `81d9e4a` | Sem Playwright; matriz de domínio |
| C3 pipeline | pending | Board `/pipeline` | — | — | — | Depende C2 |
| C4 checklists | pending | Templates e instâncias de checklist | — | — | — | Depende C2 |
| C5 validacoes | pending | Máquina de validação | — | — | — | Depende C2; libera C6 |
| C6 aprovacoes | pending | Approvals + snapshot | — | — | — | Após C5 |
| C7 pendencias | pending | Blockers | — | — | — | Depende C2 |
| C8 lembretes | pending | Reminders + política 3 dias | — | — | — | Depende C1+C2 |
| C9 reunioes | pending | Meetings | — | — | — | Depende C1+C2 |
| C10 hoje-dashboard | pending | `/hoje` operacional (fecha MVP) | — | — | — | Depende C3–C9 |
| C11 templates-de-workflow | pending | CRUD templates (pós-MVP) | — | — | — | Depende C2 |

## Contradições tratadas

- C1/C2/C0 pedem Playwright E2E; mandato desta execução (ORCH-008) substitui por testes de API/domínio.
- C0 pedia Next.js único; ORCH-003/004 exige duas portas → split web/api.
- Harness pede issue/PR no board Orbe; ORCH-009 faz push em `main` neste repo.
