# review.md — C7 Pendências / blockers

Revisão do cycle completo (tasks flat). Data: 2026-08-19.

## Blockers

Nenhum.

## Warnings

- Ficha `/pendencias/:id` não lista `sourceMeetingId` (campo persistido para C9; sem UI de reunião).
- `assigneeKind=internal` sem `assigneeUserId` devolve 400, não 404.

## Suggestions

- C8+ não deve tratar resolve de Blocker como transition `complete`.
- Checklist incompleto continua **não** virando Blocker automático.

## Escopo

Sem kanban de tickets, sem portal do cliente, sem FK de Meeting. `workspaceId` só da sessão. Playwright não entrou. Invariante de complete integrada em `domain/stage-transition.ts`.
