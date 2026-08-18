# DEFERRED_CONFIG

Configurações humanas / externas. **Nunca gravar secrets reais neste arquivo.**

| Chave | Motivo | Onde | Impacto enquanto ausente |
|---|---|---|---|
| `AUTH_SECRET` | Assinatura de sessão Auth.js | `.env` local (não git) | Dev local: gerar valor qualquer ≥32 chars |
| `DATABASE_URL` | Postgres | `.env` + Docker Compose | App não sobe sem Compose/`DATABASE_URL` |
| `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD` | Login seed | `.env` / `.env.example` placeholders | Sem seed não há owner para login |
| `NEXTAUTH_URL` / `WEB_ORIGIN` | CORS e cookies | `.env.example` | Default `http://localhost:3015` |
| Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) | Fora do C0 | — | Credentials-only até cycle futuro |
| Resend / e-mail (`RESEND_API_KEY`) | Fora do MVP | — | Lembretes só internos |
| WhatsApp | Fora do MVP | — | Sem envio externo |
| Google Calendar | Fora do C9 | — | Reuniões só no sistema |
| Domínio de produção | Deploy | — | Só localhost nesta execução |
| Convite de membros | Fora do C0 | — | Seed: 1 owner |
