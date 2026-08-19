# review.md — C4 Checklists

Revisão do cycle completo (tasks flat). Data: 2026-08-19.

## Blockers

Nenhum.

## Warnings

- `PATCH /api/checklist-templates/:id` existe para owner (teste de deep copy) sem UI — alinhado ao brief (sem CRUD UI).
- `stageId` inválido no apply devolve 404 (mesmo envelope IDOR), sem mensagem específica.

## Suggestions

- C5 pode preencher `validationId` sem mudar o contrato de apply.
- Lista `/checklists` é read-only; marcação continua na ficha.

## Escopo

Sem editor visual de templates, sem checklist como blocker, sem sync molde→instâncias. Completar item **não** altera `Stage.status`. `workspaceId` só da sessão. Playwright não entrou.
