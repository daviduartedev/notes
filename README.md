# Notes

Software House Operating System / Delivery CRM interno (depois comercializável).

A entidade operacional principal é o **Projeto**. Cliente 1:N Projeto. O quadro `/hoje` é a superfície operacional da software house.

## Desenvolvimento local

| Superfície | URL |
|---|---|
| Frontend | http://localhost:3015 |
| Backend/API | http://localhost:3014 |

Portas **obrigatórias** — não usar 3000, 3001, 5173 ou 8080 como portas principais.

## Processo

Trabalho em cycles SDD. Índice: [`cycles/README.md`](cycles/README.md). Entrypoint de agentes: [`AGENTS.md`](AGENTS.md). Estado de execução autônoma: [`docs/execution/`](docs/execution/).
