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

## C1 obrigatório

- transições de `Client.status` e `Project.status`
- DTO overdue (`active` + prazo passado)
- dois projetos no mesmo cliente + `project.created` ×2
- IDOR client/project/activity → 404 vazio
- payload de activity sem telefone/e-mail

## C2 obrigatório

- matriz de transições de etapa (domínio puro)
- pulo ilegal → 409 e nenhum `stage.transitioned`
- projeto novo com 10 etapas do template SaaS
- template editado não altera instâncias já copiadas
- IDOR na transição → 404 vazio

## C3 obrigatório

- dois projetos em `currentStage.key` diferentes aparecem só na coluna certa
- collection do workspace B não contém cards do A (colunas vazias)
- `completed`/`cancelled` e projeto sem etapa atual não entram no board

## C4 obrigatório

- mesmo template em dois projetos; mutar o molde não altera instâncias
- marcar item grava `completedByUserId` + `completedAt`; event `checklist.item_completed`
- completar item não muda `Stage.status`
- IDOR `PATCH` item outro workspace → 404 vazio
- collection `GET /api/checklists` do workspace B vazia

