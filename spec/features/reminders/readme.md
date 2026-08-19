# spec/features/reminders/readme.md

Lembrete interno de follow-up. **Não** é envio WhatsApp/e-mail. Canal só `internal`.

## Máquina

`scheduled → due → done | snoozed | cancelled`.

Ação `snooze` persiste `scheduled` com nova `dueAt` (default **+7 dias**). `complete` só de `due` (marcar enviado). `cancel` de `scheduled` ou `due`. Ilegal → 409 sem event.

## Política nomeada

`proposalWaitingClientFollowUp` (código, não engine WHEN/THEN):

- etapa atual `waiting_client`
- `now - lastInteractionAt >= 3 dias` (`lastInteractionAt` null → `createdAt`)
- no máximo um Reminder `scheduled|due` por `(projectId, policyKey)`

`GET /api/reminders` (e nested do projeto) chama `evaluateFollowUpPolicies(now)` **antes** de listar. Relógio injetável (`deps.now()`).

Draft pt-BR da proposta. Activity **não** grava o texto completo.

## Contratos

| Método | Path | Notas |
|--------|------|-------|
| GET | `/api/reminders` | evaluate on-read; filtros status/projectId/clientId; tenant B → `[]` |
| GET | `/api/reminders/:id` | 404 IDOR |
| GET | `/api/projects/:id/reminders` | 404 IDOR; evaluate |
| POST | `/api/reminders/:id/decide` | `{ action: complete\|snooze\|cancel, snoozeUntil? }` |

Sem POST de create manual. `workspaceId`/`status`/`channel`/`draftMessage` no body de decide são ignorados.

Events: `reminder.created`, `reminder.completed` no activity do **projeto**. Cancel/snooze sem event.

## Web

`/lembretes`, `/lembretes/:id`. Copiar draft, marcar enviado, adiar. Seção na ficha do projeto. Nav **Lembretes**. Visitante → `/login`.
