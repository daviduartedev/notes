# Relatório C11 — Templates de workflow

- **STATUS:** DONE
- **Cycle:** `cycles/Q32026/0818-c11-templates-de-workflow/`
- **Data:** 2026-08-19

## Tasks

Flat Medium: catálogo de 6 grafos, CRUD owner, `project.create` exige `workflowTemplateId`, UI `/workflows` — approved. **Fecha o roadmap.**

## Gates

| Comando | Exit |
|---------|------|
| `pnpm lint` | 0 |
| `pnpm typecheck` | 0 |
| `pnpm test` | 0 (187 API + 29 web) |
| `pnpm build` | 0 (`ƒ /workflows`) |
| Playwright | n/a (ORCH-008) |

## Commit / push

- Mensagem: `cycle(11): workflow templates`
- SHA: `8a76103f8d11219bfb9e4eccb155a13fad522dcc`
- Push `origin main`: ok (`31cd1c0..553c1d7`)

## Decisões

ADRs 0031–0032 em `spec/decisions.md`. SaaS default. Sem BPM.

## Deferred

Canvas/BPM, marketplace entre workspaces, recálculo de grafos antigos, Playwright.
