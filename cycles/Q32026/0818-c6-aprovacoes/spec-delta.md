# spec-delta.md — C6 Aprovações

Proposta. Promoção para `spec/` só após validação (`/update-spec`).

## Novos arquivos canônicos

| Arquivo | Conteúdo proposto |
|---------|-------------------|
| `spec/features/approvals/readme.md` | Máquina, contratos HTTP, snapshot, ≠ Validation |

## Alterações em specs globais

| Arquivo | Mudança |
|---------|---------|
| `spec/README.md` | Índice: aprovações |
| `spec/backend.md` | Contratos create/list/get/decide |
| `spec/frontend.md` | `/aprovacoes`, `/aprovacoes/:id`; seção na ficha; nav |
| `spec/database.md` | Modelo Approval; snapshot JSON |
| `spec/security.md` | IDOR 404; collection vazia; approverId da sessão |
| `spec/testing.md` | Grant+snapshot, revoke, 409, IDOR, D8, stage intacta |
| `spec/decisions.md` | ADRs C6-D1–D22 (0021–0022) |
| `spec/features/projects/readme.md` | Seção Aprovações na ficha |
| `spec/features/activity/readme.md` | Events `approval.*` |
| `spec/features/validations/readme.md` | D8: approved não cria Approval (já dito; C6 confirma) |
| `spec/features/stages/readme.md` | Grant de Approval não muda Stage.status |

## Comportamento a documentar como fato só se entregue

- Máquina pending/granted/rejected/cancelled/revoked
- Snapshot server-side imutável
- Decide só via POST
- UI lista + ficha + seção

## Não documentar como fato

Avanço automático de etapa, assinatura digital, portal do cliente, Playwright.

## Promovido em 2026-08-19

Delta do C6 foi incorporado em `spec/` (feature approvals, contratos, ADRs 0021–0022). Itens não entregues permanecem fora de `spec/` como fato: avanço automático de etapa, assinatura digital, portal do cliente, Playwright.
