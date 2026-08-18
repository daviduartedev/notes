# Stage 3 — UI na ficha

- **Status:** approved (ORCH-001, sem checkpoint humano)
- **Stage:** 3 / 4
- **Próxima stage pode começar:** sim

## Entrega

Seção **Etapas** em `/projetos/:id` (`StageBoard`): board vertical por fase, labels Caveat, pills waiting/blocked/overdue, botões da etapa atual disabled com `title` = motivo pt-BR. Histórico mostra actions `stage.*`.

## Evidências

| Comando | Exit |
|---------|------|
| `pnpm lint` / `typecheck` / `test` / `build` | 0 (gate final do cycle) |
| `labels.test.ts` | 0 |

## Desvios

Botões de ação só na etapa atual (as demais teriam o mesmo motivo “Só a etapa atual pode transicionar”). Motivo continua visível via `title` nos botões disabled da atual.

## Blockers

Nenhum.

## Escopo

Sem `/pipeline` (C3), sem editor de template.
