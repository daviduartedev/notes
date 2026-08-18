# Activity

`ActivityEvent`: workspaceId, actorId, entityType, entityId, action, payload JSON, createdAt.

## Actions

- `client.created`
- `client.updated`
- `project.created`
- `project.updated`
- `project.status_changed`

Payload consultável **sem** telefone/e-mail. Sanitizer remove essas chaves.

GET `/api/clients/:id/activity` agrega eventos do cliente e dos projetos daquele cliente. GET `/api/projects/:id/activity` só do projeto. Cross-tenant → 404 vazio.
