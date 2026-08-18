# Notes

Software House Operating System / Delivery CRM interno (depois comercializável).

A entidade operacional principal é o **Projeto**. Cliente 1:N Projeto. O quadro `/hoje` é a superfície operacional da software house.

## Desenvolvimento local

```text
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

| Superfície | URL |
|---|---|
| Frontend | http://localhost:3015 |
| Backend/API | http://localhost:3014 |
| Postgres (Compose local) | localhost:5433 |

Portas **obrigatórias** da app — não usar 3000, 3001, 5173 ou 8080 como portas principais. Compose local usa **5433** no host para não colidir com outros Postgres em 5432.

## Processo

Trabalho em cycles SDD. Índice: [`cycles/README.md`](cycles/README.md). Entrypoint de agentes: [`AGENTS.md`](AGENTS.md). Estado de execução autônoma: [`docs/execution/`](docs/execution/).
