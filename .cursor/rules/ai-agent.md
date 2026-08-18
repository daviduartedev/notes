# Regras do agente — Notes

- Partir do estado real do código.
- Nada de concluído sem evidência (lint/typecheck/test/build).
- `workspaceId` só da sessão, nunca do body.
- Enums de domínio em inglês; UI, docs e commits em português.
- Sem generic repository, event sourcing, BPM, microserviços extras.
- Sem Playwright/Cypress nesta execução (ORCH-008).
- Portas: web 3015, API 3014.
- Commits só quando o mandato/ORCH autorizar ou o humano escrever **"e faça os commits"**.
