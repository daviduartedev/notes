# spec-delta.md — C2 Etapas e transições

Proposta. Promoção para `spec/` só após validação (`/update-spec`).

## Novos arquivos canônicos

| Arquivo | Conteúdo proposto |
|---------|-------------------|
| `spec/features/stages/readme.md` | Template SaaS, instância ≠ template, grafo, transições, API, UI na ficha |

## Alterações em specs globais

| Arquivo | Mudança |
|---------|---------|
| `spec/README.md` | Índice: stages |
| `spec/backend.md` | `POST /api/projects/:id/stages/:stageId/transition`; GET ficha com stages |
| `spec/frontend.md` | Seção Etapas em `/projetos/:id` |
| `spec/database.md` | WorkflowTemplate, StageTemplate, Stage; FKs no Project |
| `spec/security.md` | IDOR na transição; PATCH currentStageId ignorado |
| `spec/testing.md` | Matriz de transições; pulo ilegal sem event; template vs instância |
| `spec/decisions.md` | ADRs C2-D1–D15 |
| `spec/features/projects/readme.md` | Etapas existem; envelope ≠ pipeline |
| `spec/features/activity/readme.md` | Actions `stage.*` |

## Comportamento a documentar como fato só se entregue

- Um template SaaS por workspace (seed)
- Deep copy na criação do projeto (transação)
- Transição só com aresta + status permitido
- `blocked` não completa; completed não reabre
- 409 sem event de transição; 404 cross-tenant
- Histórico com payload `from`/`to`
- Mutar template não altera instâncias já copiadas

## Promovido em 2026-08-18

Delta do C2 foi incorporado em `spec/` (feature stages, contratos, modelos, testes, ADRs 0012–0014).

Itens não entregues (intenção futura) permanecem fora de `spec/` como fato: editor de workflow, múltiplos templates na UI, `/pipeline`, checklists, validações, aprovações, entidade Blocker, Playwright.
