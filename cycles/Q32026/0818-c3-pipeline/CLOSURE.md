# CLOSURE.md — C3 Pipeline

**Cycle:** `cycles/Q32026/0818-c3-pipeline/`  
**Tipo:** Medium  
**Status:** fechado  
**Data:** 2026-08-19

## Resumo

Quadro `/pipeline` com dez colunas SaaS. Cada projeto `draft|active|on_hold` aparece só na coluna da `currentStage.key`. Click no card abre a ficha. Sem drag-and-drop.

## Valor

Operador vê o andamento de todos os projetos do workspace num único board, com filtros e sem misturar tenants.

## O que o próximo cycle pode assumir

- `GET /api/pipeline` existe e é scoped à sessão
- UI `/pipeline` na nav; middleware protege a rota
- Transições continuam só na ficha (C2)
- `/hoje` continua empty state (C10)
- Sem Playwright

## Não começar C4 neste chat

Próximo cycle: `0818-c4-checklists`.
