# spec-delta.md — C12 (proposta, não promovida)

## spec/frontend.md

- Nav: **Dashboard** (href `/hoje`) no lugar de Hoje.
- Título da página operacional: Dashboard.
- Coluna do quadro C10 permanece **Hoje**.
- AppShell: gutter `--page-gutter` (2rem), max-width `--page-max` (72rem); nav centrada.
- Primitivos: Button, Input, Card, StatusPill, Select (min-width), Textarea, ícones lucide.
- `/design-system`: tokens de espaçamento + ícones; 404 em production.

## spec/features/hoje/readme.md

- Página: Dashboard (`/hoje`).
- `needs_attention` também inclui reminder `scheduled|due` e meeting cujo dia UTC está em 1…`attentionLeadDays` dias no futuro.
- Card ganha `alert: boolean` (true para esses itens de antecedência).
- UI: ícone sino quando `alert`; input de antecedência na seção Precisa de atenção.

## spec/features/reminders/readme.md

- `POST /api/reminders` `{ draftMessage, dueAt, clientId, projectId }` — `workspaceId` ignorado.
- `policyKey=manual`; `channel=internal`; `subjectType=project`.
- Projeto deve pertencer ao cliente e ao workspace da sessão; senão 400.
- Status `due` se `dueAt <= now`, senão `scheduled`.
- Event `reminder.created` no projeto (sem texto do draft).
- Web: formulário em `/lembretes` e na ficha do projeto.

## spec/database.md

- `Workspace.attentionLeadDays` Int default 3.

## spec/features/workspace/readme.md

- GET workspace inclui `attentionLeadDays`.
- PATCH `/api/workspace` `{ attentionLeadDays: 0..30 }`; `workspaceId` do body ignorado.
