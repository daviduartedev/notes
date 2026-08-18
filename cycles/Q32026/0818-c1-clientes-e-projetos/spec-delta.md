# spec-delta.md — C1 Clientes e Projetos

Proposta. Promoção para `spec/` só após validação (`/update-spec`).

## Novos arquivos canônicos

| Arquivo | Conteúdo proposto |
|---------|-------------------|
| `spec/features/clients/readme.md` | CRUD cliente, status/transições, filtros, rotas web/API |
| `spec/features/projects/readme.md` | CRUD projeto, envelope de status, prioridade, progresso, overdue, 1:N |
| `spec/features/activity/readme.md` | `ActivityEvent`, actions, payload sem PII, GET nas fichas |

## Alterações em specs globais

| Arquivo | Mudança |
|---------|---------|
| `spec/README.md` | Índice: clients, projects, activity |
| `spec/backend.md` | Contratos `/api/clients`, `/api/projects`, members, activity; CORS PATCH/PUT/DELETE |
| `spec/frontend.md` | Rotas `/clientes`, `/projetos`; nav Hoje/Clientes/Projetos; overdue |
| `spec/database.md` | Modelos Client, Project, ActivityEvent + enums |
| `spec/security.md` | IDOR 404 em client/project/activity; mass assignment |
| `spec/testing.md` | Cenários C1: dois projetos, IDOR, transição, overdue (sem Playwright) |
| `spec/decisions.md` | ADRs C1-D1–D20 (status, transições, overdue, activity) |

## Comportamento a documentar como fato só se entregue

- Cliente 1:N Projeto no mesmo workspace
- `lookupForSession` em client/project/activity → 404 vazio
- `visualState: "overdue"` para projeto `active` com `dueDate` passado
- Actions de activity exatamente as do request
- `/hoje` continua empty state

## Promovido em 2026-08-18

Delta do C1 foi incorporado em `spec/` (features clients/projects/activity, contratos backend/frontend, modelos database, testes, ADRs 0009–0011).

Itens não entregues (intenção futura) permanecem fora de `spec/` como fato: etapas, pipeline, checklists, validações, aprovações, pendências, lembretes, reuniões, `/hoje` operacional, Playwright, Stage/WorkflowTemplate.

