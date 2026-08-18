# AGENTS.md — Delivery OS (Notes)

> Entrypoint para agentes de IA e novas janelas de contexto.
> **Leia este arquivo primeiro.** Última atualização: **18/08/2026**.

## O que é

SaaS interno (depois comercializável) de **Software House Operating System / Delivery CRM**.
A entidade operacional principal é o **Projeto**. Não é um CRM só comercial.

Workspace atual: `c:\dev\utopia\internal\notes`. Stack confirmada no C0: Next.js App Router (`apps/web` :3015) + Hono/Prisma/Auth.js (`apps/api` :3014) + PostgreSQL 16 + pnpm + Zod + Vitest. Sem Playwright nesta execução.

## Metodologia — Ciclos SDD (padrão Elli + Harness da casa)

Trabalho organizado em `cycles/Q{T}{ano}/{MMDD}-cN-slug/`.

Fluxo (como no Elli e no Harness Lignum/Casca/Movix):

```text
request.md  →  refine  →  plan.md + tasks.md + scenarios.feature + spec-delta.md
        →  execute (Large: uma stage por vez)
        →  review  →  validate  →  update-spec  →  close
```

Prompts para colar em **chat novo** por janela: `cycles/prompts/` e `JANELAS.md` de cada cycle.

## Regras de ouro

1. Partir do estado real do código — o repo começa vazio; não inventar o que o cycle anterior não entregou.
2. Nada de concluído sem evidência (lint/typecheck/test/build rodados de verdade).
3. Commits só se o humano pedir explicitamente **"e faça os commits"**.
4. Todo dado operacional leva `workspaceId` da sessão, nunca do body.
5. Template ≠ instância. Validação ≠ aprovação. Checklist ≠ pendência. Cliente 1:N Projeto.
6. Idioma: **português** em docs, specs, commits e UI. Enums de domínio em **inglês**.
7. Não implementar fora do `tasks.md` do cycle ativo.

## Cycles

Índice: [`cycles/README.md`](cycles/README.md).

## Stack confirmada (C0)

Next.js App Router (`apps/web` :3015) + Hono + Prisma + Auth.js (`apps/api` :3014) + PostgreSQL 16 + pnpm + Zod + Vitest. Sem Playwright nesta execução.

Referência de processo: Elli (`C:\dev\orbesoft\elli\cycles`). Referência de Harness: CascaBJJ / Lignum / Movix.
