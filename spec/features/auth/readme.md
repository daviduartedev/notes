# Auth

Login credentials na API. Sessão JWT Auth.js em cookie HttpOnly `authjs.session-token`.

## Rotas

| Método | Path | Resultado |
|--------|------|-----------|
| POST | `/api/auth/login` | cookie de sessão |
| POST | `/api/auth/logout` | limpa cookie |

Visitante em `/hoje` é redirecionado para `/login`.

Sem OAuth, convite ou 2FA.
