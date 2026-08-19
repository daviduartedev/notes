# review.md — C8 Lembretes e follow-ups

Revisão do cycle completo (tasks flat). Data: 2026-08-19.

## Blockers

Nenhum.

## Warnings

- `GET /api/reminders/:id` não reavalia políticas (só a listagem e o nested do projeto).
- Enum `snoozed` existe no banco; a ação snooze persiste `scheduled` com nova `dueAt`.

## Suggestions

- C10 pode consumir reminders due em `/hoje` sem novo canal.
- Não ligar WhatsApp/e-mail neste modelo; `channel` permanece `internal`.

## Escopo

Sem motor WHEN/THEN, sem envio externo, sem Calendar. `workspaceId` só da sessão. Playwright não entrou. Política `proposalWaitingClientFollowUp` com relógio injetável.
