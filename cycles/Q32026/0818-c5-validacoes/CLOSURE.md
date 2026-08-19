# CLOSURE.md — C5 Validações

**Cycle:** `cycles/Q32026/0818-c5-validacoes/`  
**Tipo:** Medium  
**Status:** fechado  
**Data:** 2026-08-19

## Resumo

Máquina de validação (`draft` → … → terminais) com transição só via POST. Overdue visual quando o prazo venceu e o status não é terminal. Checklist C4 pode ser ligado. `changes_requested` não recua etapa e não cria Approval.

## Valor

Operador solicita e conduz verificação no projeto sem misturar com aprovação formal (C6).

## O que o próximo cycle pode assumir

- `POST /api/projects/:id/validations` e `POST /api/validations/:id/transition` existem e são scoped à sessão
- `Validation.status === approved` **não** é Approval
- UI `/validacoes` e `/validacoes/:id` na nav; seção na ficha do projeto
- `ProjectChecklist.validationId` pode estar preenchido
- Sem Playwright

## Não começar C6 neste chat

Próximo cycle: `0818-c6-aprovacoes`.
