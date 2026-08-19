# Reuniões / meetings

Reunião é registro operacional. **Não** avança etapa. **Não** gera Blocker, Validation nem Approval.

## Tipos

`kickoff | scope_alignment | prototype_review | staging_validation | production_validation | delivery`.

## Campos

título, tipo, `startsAt`, `participantUserIds` (membros do workspace), notas, decisões, próximos passos. Vínculos opcionais: `clientId`, `projectId`, `stageId`, `validationId`. Exigir `projectId` ou `clientId`. Se ambos, o cliente deve ser o do projeto. `stageId` só com projeto. `validationId` da mesma workspace (e do projeto/cliente quando informados).

Participante fora do workspace → **400** `{ error, reason: "Participante fora do workspace" }`.

## API

| Método | Path | Notas |
|--------|------|-------|
| POST | `/api/meetings` | create; `workspaceId` ignorado |
| GET | `/api/meetings` | filtros type/projectId/clientId/validationId; tenant B → `[]` |
| GET | `/api/meetings/:id` | 404 IDOR |
| PATCH | `/api/meetings/:id` | conteúdo; ignora `workspaceId` e vínculos |
| GET | `/api/projects/:id/meetings` | 404 IDOR |
| GET | `/api/clients/:id/meetings` | 404 IDOR |

Create **não** muda `Stage.status`. Create **não** abre Blocker.

Event no projeto (ou no cliente se só `clientId`): `meeting.created`. Payload: `meetingId`, `type`, `title` — sem notas/decisões.

## Web

`/reunioes` (filtros), `/reunioes/:id`. Seção Reuniões em `/projetos/:id` e `/clientes/:id`. Nav inclui Reuniões. Visitante → `/login`.

## Fora

Google Calendar, ata rica, geração automática de tarefas/validações/blockers, Playwright.
