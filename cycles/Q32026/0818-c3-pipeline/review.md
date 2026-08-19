# review.md — C3 Pipeline

Revisão do cycle completo (tasks flat). Data: 2026-08-19.

## Blockers

Nenhum.

## Warnings

- Padding do card (`p-3` no board vs `p-6` default do primitivo) depende da ordem no CSS do Tailwind; visual menor pode não aplicar. Não afeta aceite.
- Filtro `clientId` coberto pelo store/Zod; teste HTTP explícito só de `ownerUserId`. Isolamento e agrupamento estão cobertos.

## Suggestions

- Drag-and-drop, se voltar, deve reusar `POST .../transition` (C2) com snap-back — fora deste Medium.
- C10 pode reutilizar `GET /api/pipeline` ou o DTO de card para “projetos em andamento”.

## Escopo

Sem editor de template, sem `/hoje` operacional, sem `@dnd-kit`, sem coluna inválida. `workspaceId` só da sessão. Collection GET do workspace B devolve 10 colunas vazias (não 404). Envelope `completed|cancelled` fora do quadro. Playwright não entrou.
