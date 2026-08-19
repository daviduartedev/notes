# Activity

`ActivityEvent`: workspaceId, actorId, entityType, entityId, action, payload JSON, createdAt.

## Actions

- `client.created`
- `client.updated`
- `project.created`
- `project.updated`
- `project.status_changed`
- `stage.started`
- `stage.transitioned`
- `stage.completed`
- `checklist.applied`
- `checklist.item_completed`
- `validation.requested`
- `validation.in_review`
- `validation.changes_requested`
- `validation.approved`
- `validation.rejected`
- `approval.granted`
- `approval.rejected`
- `approval.revoked`
- `blocker.opened`
- `blocker.resolved`
- `reminder.created`
- `reminder.completed`
- `meeting.created`

Payload consultável **sem** telefone/e-mail. Sanitizer remove essas chaves e o texto de draft de lembrete.

GET `/api/clients/:id/activity` agrega eventos do cliente e dos projetos daquele cliente. GET `/api/projects/:id/activity` só do projeto. Cross-tenant → 404 vazio.
