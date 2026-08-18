# plan.md — Clientes e Projetos (C1)

> **Ciclo:** `0818-c1-clientes-e-projetos`  
> **Tipo:** Large (4 stages)  
> **Data:** 18/08/2026  
> **Branch:** `main` (ORCH-009)  
> **Depende de:** C0 fechado

---

## Resumo

Entregar Cliente 1:N Projeto no workspace da sessão, fichas `/clientes` e `/projetos`, transições de status no domínio, progresso manual 0–100, e `ActivityEvent` consultável. Isolamento por testes HTTP/API (sem Playwright). `/hoje` permanece empty state.

## Diagnóstico — estado atual (C0)

| Área | Estado |
|------|--------|
| Auth / tenant | Cookie JWT, `workspaceIdFromSession`, `lookupForSession` → 404 vazio |
| Prisma | User, Workspace, Member |
| API | Hono :3014; CORS só GET/POST/OPTIONS |
| Web | Next :3015; middleware só `/hoje` e `/login`; nav inexistente |
| Domínio | Sem Client, Project, ActivityEvent |

## Decisões de produto (refinamento — fechadas; nenhuma pergunta ao humano)

| # | Tópico | Decisão | Fonte |
|---|--------|---------|--------|
| C1-D1 | Client.status | `lead \| active \| inactive \| archived` (UI: Lead, Ativo, Inativo, Arquivado) | brief |
| C1-D2 | Transições client | `lead→active\|archived`; `active→inactive\|archived`; `inactive→active\|archived`; `archived` terminal | brief |
| C1-D3 | Project.status | `draft \| active \| on_hold \| completed \| cancelled` | request + brief |
| C1-D4 | Transições project | `draft→active\|cancelled`; `active→on_hold\|completed\|cancelled`; `on_hold→active\|cancelled`; `completed` e `cancelled` terminais | brief |
| C1-D5 | Prioridade | `low \| medium \| high \| urgent` | brief |
| C1-D6 | Progresso | inteiro manual 0–100 | brief |
| C1-D7 | WhatsApp | string de contato; sem integração | brief |
| C1-D8 | Cross-tenant | 404 body vazio (ORCH-006) | brief |
| C1-D9 | Activity | `ActivityEvent`; actions `client.created`, `client.updated`, `project.created`, `project.updated`, `project.status_changed` | request |
| C1-D10 | Payload de log | sem telefone/e-mail | request |
| C1-D11 | Overdue | `visualState: "overdue"` no DTO se `active` e `dueDate < now` | brief |
| C1-D12 | E2E | Vitest HTTP + domínio; Playwright proibido | ORCH-008 |
| C1-D13 | Create client | status inicial `lead` (body `status` só aceita `lead`) | default |
| C1-D14 | Create project | status inicial `draft` (body `status` só aceita `draft`) | default |
| C1-D15 | Transição inválida | HTTP **409** `{ "error": "Transição inválida" }` | default |
| C1-D16 | DELETE client | 409 se houver projetos; senão remove | default CRUD |
| C1-D17 | DELETE project | remove o projeto | default CRUD |
| C1-D18 | Membros p/ owner | `GET /api/workspace/members` (registrado **antes** de `/:id`) | default |
| C1-D19 | Activity GET | `GET /api/clients/:id/activity` e `GET /api/projects/:id/activity` | default |
| C1-D20 | Filtro prazo | query `dueBefore` / `dueAfter` (ISO) | default |

Perguntas do `request.md` estão **todas respondidas**. Checkpoints humanos suspensos (ORCH-001).

## Arquitetura alvo

```text
apps/api/src/domain/     transições + overdue + sanitizer (sem DB)
apps/api/src/store/      memory (testes) + prisma (runtime)
apps/api/src/clients/    Zod + rotas REST /api/clients
apps/api/src/projects/   Zod + rotas REST /api/projects
apps/web                 /clientes, /clientes/:id, /projetos, /projetos/:id
                         nav: Hoje / Clientes / Projetos
```

- `workspaceId` só da sessão; body/query ignorados.
- Mass assignment: body não grava `workspaceId`/`createdAt`; status só schema/transição.
- CORS: GET, POST, PATCH, PUT, DELETE, OPTIONS.
- Middleware Next: `/hoje`, `/login`, `/clientes`, `/projetos`.

## Stages

1. **Clientes** — modelo, domínio, CRUD API, `/clientes` + `/clientes/:id`, CORS PATCH/PUT/DELETE, middleware.
2. **Projetos** — modelo, domínio, CRUD API, `/projetos` + `/projetos/:id`, lista na ficha do cliente, overdue DTO.
3. **Activity log** — `ActivityEvent`, emissão nas mutações, GET nas fichas.
4. **Isolamento** — Vitest HTTP: dois projetos + `project.created` ×2; IDOR 404; transição inválida; overdue.

## Fora de escopo

Etapas, pipeline, checklists, validações, aprovações, pendências, lembretes, reuniões, `/hoje` preenchido, busca avançada, UI 1:1 cliente/projeto, Playwright, Stage/WorkflowTemplate (C2).

## Riscos

| Risco | Mitigação |
|-------|-----------|
| CORS bloqueia PATCH | Estender `allowMethods` no C1 Stage 1 |
| `GET /api/workspace/members` capturado por `/:id` | Registrar rota estática antes |
| PII em logs | Sanitizer de payload + testes |
| Testes sem Postgres | Store em memória nos HTTP tests; persistência skipIf sem `DATABASE_URL` |

## Gates

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`
