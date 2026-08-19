# Checklists

Trabalho **previsto**. Template ≠ instância: aplicar o molde copia `name` e itens (`title`, `order`) para `ProjectChecklist` + `ChecklistItem`. Mutar o template **não** reescreve instâncias já aplicadas.

Checklist **não** é pendência e **não** altera `Stage.status`.

## Seed

Por workspace: template **Deploy Staging SaaS** (`key: deploy_staging_saas`) com 8 itens, nesta ordem: Environment, Migrations, API keys sandbox, Deploy, Smoke tests, Autenticação, Fluxo principal, Logs.

Sem CRUD UI de templates neste cycle (seed + apply). Só `owner` edita o molde via API; `member` aplica e marca itens.

## Instância

- Sempre ligada a `projectId`
- `stageId` opcional (etapa do mesmo projeto; senão 404)
- `validationId` nullable; C5 pode preenchê-lo ao ligar um checklist
- Cada apply cria uma instância nova (deep copy)

## Item

Completar grava `completedByUserId` da sessão, `completedAt` e `note` opcional. Desmarcar limpa responsável e data. Completar **não** muda a etapa.

## API

| Método | Path | Notas |
|--------|------|-------|
| GET | `/api/checklist-templates` | seed garantido; sessão |
| PATCH | `/api/checklist-templates/:id` | só `owner`; 403 member; 404 IDOR |
| POST | `/api/projects/:id/checklists/apply` | body `{ templateId, stageId? }`; 201 |
| GET | `/api/projects/:id/checklists` | 404 IDOR no projeto |
| GET | `/api/checklists` | lista do workspace; tenant B → `[]` |
| PATCH | `/api/checklist-items/:id` | `{ completed, note? }`; 404 IDOR |

`workspaceId` no body/query é ignorado.

Events no `ActivityEvent` do projeto: `checklist.applied`, `checklist.item_completed` (só na transição para concluído).

## Web

Seção **Checklists** em `/projetos/:id` (apply + marcar). Lista `/checklists` das instâncias do workspace. Nav e middleware protegem a rota.
