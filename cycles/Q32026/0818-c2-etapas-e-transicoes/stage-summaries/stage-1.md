# Stage 1 — Domínio + testes da matriz

- **Status:** approved (ORCH-001, sem checkpoint humano)
- **Stage:** 1 / 4
- **Próxima stage pode começar:** sim

## Entrega

Tipos de template/instância, grafo seed SaaS delivery (10 keys lineares), funções puras `copyStageFromTemplate` / `instantiateProjectStages` / `evaluateStageAction` / `applyStageAction` / `listStageActions` com motivos em pt-BR. Testes da matriz: arestas válidas, pulo ilegal, blocked, completed terminal, instância ≠ template, uma etapa atual.

## Evidências

| Comando | Exit |
|---------|------|
| `vitest` domínio (`saas-delivery-template`, `stage-instance`, `stage-transition`) | 0 (10 testes) |

## Desvios

Nenhum.

## Blockers

Nenhum.

## Escopo

Sem Prisma, sem rotas HTTP, sem UI.
