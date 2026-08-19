# spec-delta.md — C4 Checklists

Proposta. Promoção para `spec/` só após validação (`/update-spec`).

## Novos arquivos canônicos

| Arquivo | Conteúdo proposto |
|---------|-------------------|
| `spec/features/checklists/readme.md` | Template ≠ instância; apply; completar item; contratos HTTP |

## Alterações em specs globais

| Arquivo | Mudança |
|---------|---------|
| `spec/README.md` | Índice: checklists |
| `spec/backend.md` | Contratos apply/list/patch |
| `spec/frontend.md` | `/checklists`; seção na ficha; nav |
| `spec/database.md` | Modelos C4 |
| `spec/security.md` | IDOR item 404; collection vazia; owner-only PATCH template |
| `spec/testing.md` | Deep copy, IDOR, stage intacta |
| `spec/decisions.md` | ADRs C4-D1–D17 (0017–0018) |
| `spec/features/projects/readme.md` | Seção Checklists na ficha |
| `spec/features/activity/readme.md` | `checklist.applied`, `checklist.item_completed` |
| `spec/features/stages/readme.md` | Checklist não muda `Stage.status` |

## Comportamento a documentar como fato só se entregue

- Seed `Deploy Staging SaaS` com 8 itens
- Deep copy no apply; mutar molde não reescreve instâncias
- Completar item: sessão + `completedAt` + note opcional
- Completar item não altera etapa
- Sem CRUD UI de templates

## Não documentar como fato

Editor visual de templates, checklist como blocker, `validationId` preenchido (C5), Playwright.

## Promovido em 2026-08-19

Delta do C4 foi incorporado em `spec/` (feature checklists, contratos, ADRs 0017–0018). Itens não entregues permanecem fora de `spec/` como fato: CRUD UI de templates, checklist como blocker, `validationId` preenchido, Playwright.
