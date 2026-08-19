# Brief — Cycle 04 Agent (Checklists)

Você é o **Cycle 04 Agent**. Contexto limpo. Não pergunte. Não inicie C5+.

## Paths

- Workspace: `c:\dev\utopia\internal\notes`
- Cycle: `cycles/Q32026/0818-c4-checklists/`
- Tipo: Medium (flat)
- Estado: `docs/execution/CURRENT_STATE.md`, `ORCHESTRATOR.md`, `DECISIONS.md`
- Relatório: `docs/execution/reports/c4-report.md`

## Missão

Refine → flat execute → review → validate → update-spec → close → commit `cycle(04): checklists` → push → atualizar execution docs.

## Herança

- Prisma patterns, `lookupForSession`, ActivityEvent, `apps/api/src/domain/`, AppShell nav
- Project + Stage (C2); sem alterar `Stage.status` ao completar checklist
- Portas 3015/3014, sem Playwright

## Decisões fechadas

| Tópico | Decisão |
|---|---|
| Template edit | Só `owner` pode criar/editar templates; `member` pode apply e marcar itens |
| UI templates | Seed + apply neste cycle; **sem** CRUD UI de templates (só seed no workspace) |
| Deep copy | Ao aplicar template → `ProjectChecklist` + `ChecklistItem` cópia independente |
| `validationId` | nullable, sempre null neste cycle |
| Relação | Checklist ligado a `projectId` e opcional `stageId` |
| Seed template | **Deploy Staging SaaS** com itens: environment, migrations, API keys sandbox, deploy, smoke tests, autenticação, fluxo principal, logs |
| Events | `checklist.applied`, `checklist.item_completed` |
| Completar item | grava `completedByUserId` (sessão), `completedAt`, observação opcional |

## Modelos

- `ChecklistTemplate` (workspaceId, name, description?)
- `ChecklistTemplateItem` (templateId, title, order)
- `ProjectChecklist` (workspaceId, projectId, stageId?, templateId?, name)
- `ChecklistItem` (checklistId, title, order, completedAt?, completedByUserId?, note?)

## API (sugestão)

- `POST /api/projects/:id/checklists/apply` body `{ templateId, stageId? }`
- `GET /api/projects/:id/checklists`
- `PATCH /api/checklist-items/:id` body `{ completed: boolean, note? }` — completedBy da sessão
- `GET /api/checklists` lista workspace (opcional se couber)

## UI

- Seção na ficha `/projetos/:id`
- `/checklists` lista instâncias do workspace (se couber Medium)
- Nav + middleware se nova rota

## Aceite

- Mesmo template em 2 projetos; editar template depois não muda instâncias
- Marcar item → responsável + completedAt
- IDOR item outro workspace → 404

## Commit

`cycle(04): checklists`

Retorno: STATUS, SHA, gates, report path, ≤10 linhas.
