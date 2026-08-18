# implementation-notes.md — C2 Etapas e transições

Diário técnico.

## Refine

- **Status:** done (ORCH-001; sem perguntas ao humano)
- Decisões C2-D1–D15 em `plan.md` / `spec-delta.md`
- Playwright substituído por Vitest HTTP (ORCH-008)
- Grafo linear fechado no plan (10 keys SaaS delivery)

## Stage 1

- **Status:** done
- **Arquivos:** `domain/types.ts` (stage enums + actions), `saas-delivery-template.ts`, `stage-instance.ts`, `stage-transition.ts` + testes
- **Comandos:** vitest domínio 10 testes, exit 0
- **Riscos / desvios:** nenhum

## Stage 2

- **Status:** done
- **Arquivos:** Prisma + migration `20260818250000_stages`; store memory/prisma com transação de cópia; `POST .../transition`; seed + backfill
- **Comandos:** migrate/seed exit 0; `stages.routes.test.ts` 8 testes
- **Riscos / desvios:** FK circular resolvida com `currentStageId` ON DELETE SET NULL

## Stage 3

- **Status:** done
- **Arquivos:** `stage-board.tsx`, ficha `/projetos/[id]`, labels Caveat, activity `stage.*`
- **Comandos:** lint/typecheck/test/build exit 0
- **Riscos / desvios:** botões só na etapa atual

## Stage 4

- **Status:** done
- **Arquivos:** `persist-c2.test.ts`
- **Comandos:** lint/typecheck/test/build exit 0 (72 API + 13 web)
- **Riscos / desvios:** sem Playwright (ORCH-008)
