# spec-delta.md — C8 Lembretes e follow-ups

Proposta. Promoção para `spec/` só após validação (`/update-spec`).

## Novos arquivos canônicos

| Arquivo | Conteúdo proposto |
|---------|-------------------|
| `spec/features/reminders/readme.md` | Máquina, política nomeada, contratos HTTP, canal internal |

## Alterações em specs globais

| Arquivo | Mudança |
|---------|---------|
| `spec/README.md` | Índice: lembretes |
| `spec/backend.md` | Contratos GET list/get/nested + POST decide; evaluate on-read |
| `spec/frontend.md` | `/lembretes`, `/lembretes/:id`; seção na ficha; nav |
| `spec/database.md` | Modelo Reminder; `lastInteractionAt` em Client/Project |
| `spec/security.md` | IDOR 404; collection vazia; draft não logado |
| `spec/testing.md` | Política com fake clock, snooze, IDOR, sem draft no activity |
| `spec/decisions.md` | ADRs C8-D1–D25 (0025–0026) |
| `spec/features/projects/readme.md` | Seção Lembretes + lastInteractionAt |
| `spec/features/clients/readme.md` | lastInteractionAt |
| `spec/features/activity/readme.md` | Events `reminder.created`, `reminder.completed`; sanitizer de draft |
| `spec/features/stages/readme.md` | waiting_client alimenta política C8 |

## Comportamento a documentar como fato só se entregue

- Política `proposalWaitingClientFollowUp` on-read
- Máquina scheduled/due/done/snoozed/cancelled (snooze → scheduled)
- UI copiar / enviado / adiar
- Canal somente internal

## Promovido em 2026-08-19

Delta do C8 foi incorporado em `spec/` (feature reminders, contratos, ADRs 0025–0026). Itens não entregues permanecem fora de `spec/` como fato: WhatsApp, e-mail, Calendar, motor genérico, `/hoje` operacional, Playwright, C9+.
