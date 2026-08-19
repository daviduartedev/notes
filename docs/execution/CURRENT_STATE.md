# CURRENT_STATE

Atualizado: 2026-08-19 (C11 `8a76103f8d11219bfb9e4eccb155a13fad522dcc`).

## Produto

- Nome interno de UI: **Notes**
- Tipo: Software House Operating System / Delivery CRM
- Entidade operacional: **Project** (C1 envelope + C2 etapas + C3 board + C4 checklists + C5 validações + C6 aprovações + C7 pendências + C8 lembretes + C9 reuniões + C10 hoje operacional + C11 templates de workflow)
- Tenant: `workspaceId` sempre da sessão, nunca do body
- **MVP fechado** no C10; **roadmap desta execução fechado** no C11

## Stack (C0–C11)

- Monorepo **pnpm** (Node 22)
- `apps/web` — Next.js App Router + Tailwind — porta **3015**
- `apps/api` — Hono + Prisma 6 + Auth.js credentials — porta **3014**
- PostgreSQL 16 via Docker Compose (host local **5433**; CI **5432**)
- Zod, Vitest, ESLint
- Enums de domínio em inglês; UI e docs em português

## O que já existe no repo

- Harness em `spec/` + `.cursor/commands/`
- Auth credentials, seed 1 workspace + 1 owner + catálogo de 6 workflows (SaaS default) + checklist Deploy Staging SaaS
- `/login`, `/hoje` quadro operacional (4 seções), `/design-system` (dev)
- `/clientes`, `/clientes/:id`, `/projetos`, `/projetos/:id` (Etapas + Checklists + Validações + Aprovações + Pendências + Lembretes + Reuniões)
- `/pipeline` board por etapa atual (click-only; colunas extras C11)
- `/workflows` CRUD owner de templates (formulário; sem BPM)
- `/checklists` lista de instâncias
- `/validacoes`, `/validacoes/:id`
- `/aprovacoes`, `/aprovacoes/:id`
- `/pendencias`, `/pendencias/:id`
- `/lembretes`, `/lembretes/:id`
- `/reunioes`, `/reunioes/:id`
- CI GitHub Actions (lint, typecheck, test, build + migrate)

## Auth / banco / módulos

- Auth: credentials na API, cookie `authjs.session-token`
- Banco: User, Workspace, Member, Client, Project, ActivityEvent, WorkflowTemplate (`isDefault`), StageTemplate, Stage, ChecklistTemplate, ChecklistTemplateItem, ProjectChecklist, ChecklistItem, Validation, Approval, Blocker, Reminder, Meeting
- Módulos: clientes, projetos, activity, etapas, pipeline board, workflows, checklists, validações, aprovações, pendências, lembretes, reuniões, hoje

## Contratos

- C0: `GET /health`, login/logout, `/api/me`, `/api/workspace`
- C1: `/api/clients`, `/api/projects`, `/api/workspace/members`, activity nas fichas
- C2: `POST /api/projects/:id/stages/:stageId/transition`; GET ficha com `stages`
- C3: `GET /api/pipeline` → `{ columns }` (10 SaaS + extras)
- C4: apply/list/patch checklists; `PATCH /api/checklist-items/:id`; templates owner-only
- C5: create/list/get/patch validations; `POST /api/validations/:id/transition`
- C6: `POST /api/approvals`; `POST /api/approvals/:id/decide`; GET lista/ficha/projeto
- C7: `POST /api/blockers`; `POST /api/blockers/:id/decide`; GET lista/ficha/projeto
- C8: `GET /api/reminders` (evaluate on-read); `POST /api/reminders/:id/decide`; GET lista/ficha/projeto
- C9: `POST/GET/PATCH /api/meetings`; nested projeto/cliente; GET lista/ficha
- C10: `GET /api/hoje` → `{ needs_attention, today, waiting_client, in_progress }`; máx. 20/seção; evaluate on-read
- C11: CRUD `/api/workflow-templates`; `POST /api/projects` exige `workflowTemplateId`; GET member+owner; mutação owner-only
- Cross-tenant → 404 vazio em recurso por id; collection pipeline/checklists/validations/approvals/blockers/reminders/meetings/hoje/workflow-templates → vazio
- Sem membership → 403
- CORS inclui PATCH/PUT/DELETE
- `visualState: overdue` para projeto `active` com prazo passado e para validação não terminal com prazo passado
- PATCH `currentStageId` ignorado; PATCH validation `status` ignorado; `approverId` no body de Approval ignorado
- Completar checklist **não** muda `Stage.status`
- `changes_requested` **não** muda `Stage.status` nem cria Approval
- Grant de Approval **não** avança etapa; `Validation.approved` **não** cria Approval
- Blocker open a bloquear etapa/projeto **rejeita** complete; resolve **não** avança etapa; Blocker ≠ Checklist
- Reminder canal `internal`; política `proposalWaitingClientFollowUp`; draft não vai para o activity
- Meeting **não** muda etapa nem gera Blocker; participantes externos → 400
- Mutar WorkflowTemplate **não** reescreve instâncias já copiadas

## Como rodar

```text
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Dependências externas

- Docker Desktop
- Node 22, pnpm 10
- Origin `https://github.com/daviduartedev/notes.git`
