# CLOSURE.md — C11 Templates de workflow

**Cycle:** `cycles/Q32026/0818-c11-templates-de-workflow/`  
**Tipo:** Medium  
**Status:** fechado  
**Data:** 2026-08-19

## Resumo

CRUD de modelos de workflow (formulário, owner). Catálogo seedado: Landing, Institucional, SaaS (default), App, E-commerce, Manutenção. `POST /api/projects` exige `workflowTemplateId` do workspace. Mutar o molde não reescreve instâncias. Sem canvas BPM. **Fecha o roadmap desta execução.**

## Valor

O owner configura pipelines por tipo de entrega; o operador escolhe o molde na criação e recebe etapas distintas.

## O que o próximo cycle pode assumir

- Seis templates seedados por workspace; `saas_delivery` default
- GET/POST/PATCH/DELETE `/api/workflow-templates`; member só GET
- Create de projeto sem `workflowTemplateId` → 400
- UI `/workflows` owner; seletor no create
- Sem Playwright; sem BPM; sem recálculo de projetos antigos

## Roadmap desta execução

C0–C11 concluídos. Não há cycle seguinte neste mandato.
