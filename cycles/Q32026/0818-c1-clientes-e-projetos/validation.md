# validation.md — C1 Clientes e Projetos

Data: 2026-08-18. Nada de concluído sem comando executado.

### Gate results

| Comando | Resultado | Exit | Observacoes |
|---------|-----------|------|-------------|
| `pnpm lint` | pass | 0 | ESLint web + api |
| `pnpm typecheck` | pass | 0 | tsc --noEmit |
| `pnpm test` | pass | 0 | 53 testes API + 12 web |
| `pnpm build` | pass | 0 | Next.js 15.5 + tsc api |
| `pnpm test:e2e` | n/a | — | ORCH-008, sem Playwright |
| `prisma migrate deploy` | pass | 0 | clients, projects, activity |

### Scenario mapping

| Cenario Gherkin | Evidencia automatizada | Smoke/manual | Status | Observacoes |
|-----------------|------------------------|--------------|--------|-------------|
| Criar cliente no workspace da sessão | `clients/routes.test.ts`, `persist-c1.test.ts` | — | pass | body `workspaceId` ignorado |
| Filtrar clientes | `clients/routes.test.ts` nome/responsável/status | — | pass | |
| Transição inválida de status do cliente | `client-status.test.ts` + PATCH 409 | — | pass | archived→active |
| Dois projetos no mesmo cliente | `projects/routes.test.ts`, `persist-c1.test.ts` | — | pass | listagem `?clientId=` |
| Histórico project.created ×2 | `activity/routes.test.ts`, `persist-c1.test.ts` | — | pass | payload sem e-mail/whatsapp |
| Isolamento entre workspaces | GET client/project/activity 404 vazio | — | pass | memória + Postgres |
| Transição inválida de status do projeto | `project-status.test.ts` + PATCH draft→completed 409 | — | pass | |
| Prazo vencido em projeto ativo | `overdue.test.ts` + DTO `visualState` | — | pass | |
| Mass assignment bloqueado | create client/project ignora workspaceId/createdAt | — | pass | |

### Gaps e riscos

- Persistência skip se não houver `DATABASE_URL`. CI aplica migrate + service Postgres.
- Sem Playwright; aceite de UI coberto por DTO `visualState` e rotas web existentes.
