# spec-delta.md — C7 Pendências / blockers

Proposta. Promoção para `spec/` só após validação (`/update-spec`).

## Novos arquivos canônicos

| Arquivo | Conteúdo proposto |
|---------|-------------------|
| `spec/features/blockers/readme.md` | Máquina, ≠ Checklist, contratos HTTP, invariante complete |

## Alterações em specs globais

| Arquivo | Mudança |
|---------|---------|
| `spec/README.md` | Índice: pendências |
| `spec/backend.md` | Contratos create/list/get/decide |
| `spec/frontend.md` | `/pendencias`, `/pendencias/:id`; seção na ficha; nav; pills pipeline |
| `spec/database.md` | Modelo Blocker |
| `spec/security.md` | IDOR 404; collection vazia; assigneeUserId da sessão/member |
| `spec/testing.md` | Complete 409, resolve sem avançar, IDOR, ≠ checklist |
| `spec/decisions.md` | ADRs C7-D1–D22 (0023–0024) |
| `spec/features/projects/readme.md` | Seção Pendências + indicador |
| `spec/features/activity/readme.md` | Events `blocker.opened`, `blocker.resolved` |
| `spec/features/stages/readme.md` | Complete rejeitado com Blocker open; entidade Blocker |
| `spec/features/pipeline/readme.md` | Pills Pendência / Aguardando cliente |
| `spec/features/checklists/readme.md` | Checklist ≠ Blocker |

## Comportamento a documentar como fato só se entregue

- Máquina open/resolved/cancelled
- Auto `Stage.status=blocked` na etapa atual
- Invariante complete em `stage-transition.ts`
- Resolve desbloqueia sem avançar
- UI lista + ficha + seção + pipeline

## Promovido em 2026-08-19

Delta do C7 foi incorporado em `spec/` (feature blockers, contratos, ADRs 0023–0024). Itens não entregues permanecem fora de `spec/` como fato: checklist → blocker automático, kanban de tickets, portal do cliente, FK de reunião, Playwright, C8+.
