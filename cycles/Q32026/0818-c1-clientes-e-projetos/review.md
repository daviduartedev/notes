# review.md — C1 Clientes e Projetos

Revisão do cycle completo (stages 1–4). Data: 2026-08-18.

## Blockers

Nenhum.

## Warnings

- Páginas `/clientes` e `/projetos` fazem fetch server-side para a API `:3014`; em `next build` são dinâmicas (`ƒ`), não pré-renderizam dados.
- DELETE de cliente/projeto existe na API, sem botão na UI (CRUD via PATCH de status / criação).

## Suggestions

- Extrair helpers Zod de data compartilhados entre clients/projects.
- Trocar âncoras internas por `next/link` (não bloqueante).

## Escopo

Sem etapas, pipeline, checklists, validações, Playwright, `/hoje` operacional. `workspaceId` não é lido do body. Cross-tenant 404 vazio.
