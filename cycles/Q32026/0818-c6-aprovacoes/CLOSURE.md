# CLOSURE.md — C6 Aprovações

**Cycle:** `cycles/Q32026/0818-c6-aprovacoes/`  
**Tipo:** Medium  
**Status:** fechado  
**Data:** 2026-08-19

## Resumo

Aprovação formal com snapshot server-side. Máquina `pending → granted|rejected|cancelled` e `granted → revoked` (mesmo registro). Grant **não** avança etapa. Validação aprovada **não** cria Approval (D8).

## Valor

Operador registra autorização (proposta, escopo, staging, etc.) com quem/quando/estado do projeto, sem misturar com verificação (C5).

## O que o próximo cycle pode assumir

- `POST /api/approvals` e `POST /api/approvals/:id/decide` existem e são scoped à sessão
- `approverId` vem da sessão no decide; body ignorado
- Snapshot JSON imutável no create (`currentStageKey`, `projectStatus`, `validationId`, `projectId`, `clientId`)
- UI `/aprovacoes` e `/aprovacoes/:id` na nav; seção na ficha do projeto
- Events `approval.granted|rejected|revoked` no activity do projeto
- Sem Playwright; grant não chama transition C2

## Não começar C7 neste chat

Próximo cycle: `0818-c7-pendencias`.
