# spec/database.md

- PostgreSQL **16** via Docker Compose (`docker-compose.yml`).
- ORM: **Prisma 6** em `apps/api`.
- Sem SQLite de produção.
- Local: Compose publica Postgres em **5433** (evita colidir com outros Postgres em 5432). CI GitHub Actions usa **5432**.

## Modelos C0 (Stage 4)

- `User` — email único, password hash, `sessionVersion` (incrementado no logout)
- `Workspace` — tenant
- `Member` — `userId` + `workspaceId` + `role` (`owner` \| `member`)

Unique `(workspaceId, userId)` em Member.

Seed C0: 1 workspace, 1 owner (e-mail/senha via env placeholders).

## Modelos C1

- `Client` — status `lead|active|inactive|archived`; ownerUserId; contato WhatsApp/e-mail opcionais
- `Project` — status `draft|active|on_hold|completed|cancelled`; prioridade; progresso 0–100; prazo
- `ActivityEvent` — action string pontuada; payload JSON sem PII de contato

Seed: não cria clientes/projetos (fixtures nos testes; segundo workspace só nos testes de IDOR).

## Modelos C2

- `WorkflowTemplate` / `StageTemplate` — seed `saas_delivery` por workspace
- `Stage` — instância copiada no projeto; `Project.currentStageId`, `Project.workflowTemplateId`

Seed C2: template SaaS no workspace; backfill de projetos sem etapas.

## Modelos C4

- `ChecklistTemplate` / `ChecklistTemplateItem` — seed `deploy_staging_saas` por workspace
- `ProjectChecklist` — instância copiada no apply (`projectId`, `stageId?`, `templateId?`, `validationId` sempre null neste cycle)
- `ChecklistItem` — cópia dos títulos; `completedAt`, `completedByUserId`, `note`

Seed C4: template **Deploy Staging SaaS** (8 itens) no workspace.
