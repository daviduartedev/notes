# review.md — C2 Etapas e transições

Revisão do cycle completo (stages 1–4). Data: 2026-08-18.

## Blockers

Nenhum.

## Warnings

- A UI da ficha mostra botões de transição só na etapa atual; as demais não repetem o mesmo conjunto disabled.
- Páginas `/projetos/:id` continuam Server Components com fetch na API `:3014` (dinâmicas no `next build`).

## Suggestions

- C3 pode reutilizar `currentStageKey` / `phase` do DTO para o board `/pipeline`.
- Extrair `listStageActions` para o web só se a ficha precisar otimista; hoje a API é a fonte da verdade.

## Escopo

Sem editor de workflow, sem `/pipeline`, sem checklists/validações, sem entidade Blocker, sem Playwright. `workspaceId` não é lido do body. PATCH `currentStageId` ignorado. Cross-tenant 404 vazio. Template ≠ instância coberto por teste.
