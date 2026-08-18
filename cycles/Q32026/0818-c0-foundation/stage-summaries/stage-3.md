# Stage 3 — Auth

- **Status:** approved (ORCH-001)
- **Próxima stage pode começar:** sim

## Entrega

Credentials via Auth.js JWT (`@auth/core`), cookie HttpOnly, CORS `http://localhost:3015`, login/logout, proteção `/hoje` → `/login`.

## Evidências

Testes de encode/decode e route-guard. `POST /api/auth/login` 200 no smoke com seed.

## Desvios

Login JSON próprio (não callback CSRF do Auth.js) para o split de portas. Sem OAuth/2FA/convite.
