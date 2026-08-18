# CLOSURE.md — C2 Etapas e transições

**Cycle:** `cycles/Q32026/0818-c2-etapas-e-transicoes/`  
**Tipo:** Large  
**Status:** fechado  
**Data:** 2026-08-18

## Resumo

Pipeline de etapas no projeto: template SaaS delivery seedado por workspace, instâncias copiadas na criação, transições só pela matriz (aresta + status). Histórico `stage.*` com payload de/para. Sem motor BPM.

## Valor

Operador avança o projeto etapa a etapa com regras explícitas, vê o board na ficha e o motivo quando a ação está disabled.

## O que o próximo cycle pode assumir

- Todo projeto tem 10 etapas copiadas (`currentStageId`, `currentStageKey`, `stages[]` no GET da ficha)
- `POST /api/projects/:id/stages/:stageId/transition` com 409 ilegal / 404 IDOR
- Envelope `Project.status` (C1) continua distinto das etapas
- `/hoje` continua empty state; `/pipeline` ainda não existe (C3)
- Sem Playwright

## Não começar C3 neste chat

Próximo cycle: `0818-c3-pipeline`.
