# CLOSURE.md — C4 Checklists

**Cycle:** `cycles/Q32026/0818-c4-checklists/`  
**Tipo:** Medium  
**Status:** fechado  
**Data:** 2026-08-19

## Resumo

Templates de checklist por workspace (seed Deploy Staging SaaS) e instâncias por deep copy no projeto. Marcar item registra responsável e data. Completar item não muda `Stage.status`. Sem CRUD UI de templates.

## Valor

Operador aplica o molde de deploy em qualquer projeto e executa os itens sem corromper o histórico quando o molde muda.

## O que o próximo cycle pode assumir

- `POST /api/projects/:id/checklists/apply` e `PATCH /api/checklist-items/:id` existem e são scoped à sessão
- `validationId` na instância é sempre null
- UI `/checklists` na nav; seção na ficha do projeto
- Sem Playwright

## Não começar C5 neste chat

Próximo cycle: `0818-c5-validacoes`.
