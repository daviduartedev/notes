# Auth

Login credentials na API. Sessão JWT Auth.js em cookie HttpOnly `authjs.session-token`.

## Rotas

| Método | Path | Resultado |
|--------|------|-----------|
| POST | `/api/auth/login` | cookie de sessão |
| POST | `/api/auth/logout` | incrementa `sessionVersion` e limpa cookie |

Visitante em `/hoje` é redirecionado para `/login`. Cookie forjado (JWT inválido) também.

Logout: replay do JWT antigo em `GET /api/me` → 401.

Sem OAuth, convite ou 2FA.
