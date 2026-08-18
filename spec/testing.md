# spec/testing.md

- **Vitest** para unitário e integração leve.
- Playwright/Cypress **proibidos nesta execução** (ORCH-008).
- Cenários Gherkin mapeiam para testes de domínio/API, não para browser E2E.

## C0 obrigatório

- sessão (encode/decode)
- proteção de rota (lógica)
- membership 403
- health
- isolamento de `workspaceId` nas queries `me` / `workspace`

Testes de domínio não exigem Postgres. Teste de persistência usa `DATABASE_URL` quando disponível (CI com service Postgres).
