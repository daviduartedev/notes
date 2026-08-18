# Workspace

Tenant = `Workspace`. Papel em `Member` (`owner` | `member`).

`workspaceId` sai **somente da sessão**. Body/query são ignorados.

- Sem membership: **403**
- Recurso de outro workspace: **404** sem payload

Seed C0: 1 workspace + 1 owner (placeholders no `.env.example`).
