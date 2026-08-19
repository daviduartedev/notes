# spec-delta.md — C5 Validações

Proposta. Promoção para `spec/` só após validação (`/update-spec`).

## Novos arquivos canônicos

| Arquivo | Conteúdo proposto |
|---------|-------------------|
| `spec/features/validations/readme.md` | Máquina, contratos HTTP, overdue, ≠ Approval |

## Alterações em specs globais

| Arquivo | Mudança |
|---------|---------|
| `spec/README.md` | Índice: validações |
| `spec/backend.md` | Contratos create/list/get/patch/transition |
| `spec/frontend.md` | `/validacoes`, `/validacoes/:id`; seção na ficha; nav |
| `spec/database.md` | Modelo Validation; `checklistId` / `validationId` |
| `spec/security.md` | IDOR 404; collection vazia; PATCH ignora status |
| `spec/testing.md` | Máquina, 409, overdue, IDOR, stage intacta |
| `spec/decisions.md` | ADRs C5-D1–D20 (0019–0020) |
| `spec/features/projects/readme.md` | Seção Validações na ficha |
| `spec/features/activity/readme.md` | Events `validation.*` |
| `spec/features/stages/readme.md` | `changes_requested` não muda `Stage.status` |
| `spec/features/checklists/readme.md` | `validationId` pode ser preenchido por C5 |

## Comportamento a documentar como fato só se entregue

- Máquina de status do brief
- Transição só via POST transition
- Overdue visual em DTO
- Checklist opcional
- UI roxa; filtros na lista

## Não documentar como fato

Entidade Approval, avanço automático de etapa, portal do cliente, Playwright.

## Promovido em 2026-08-19

Delta do C5 foi incorporado em `spec/` (feature validations, contratos, ADRs 0019–0020). Itens não entregues permanecem fora de `spec/` como fato: entidade Approval, avanço automático de etapa, portal do cliente, Playwright.
