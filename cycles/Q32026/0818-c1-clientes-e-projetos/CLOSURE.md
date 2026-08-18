# CLOSURE.md — C1 Clientes e Projetos

**Cycle:** `cycles/Q32026/0818-c1-clientes-e-projetos/`  
**Tipo:** Large  
**Status:** fechado  
**Data:** 2026-08-18

## Resumo

Clientes e projetos no workspace da sessão, fichas com histórico `ActivityEvent`, transições de status no domínio, overdue no DTO. Isolamento por testes HTTP/API (sem Playwright).

## Valor

Operador autentica, cadastra cliente, abre N projetos no mesmo cliente e consulta histórico — isolado por tenant.

## O que o próximo cycle pode assumir

- REST `/api/clients` e `/api/projects` com `lookupForSession` (404 vazio)
- `Project.status` envelope + transições; etapas ainda não existem
- `ActivityEvent` nas mutações C1
- `/hoje` continua empty state
- Sem Playwright

## Não começar C2 neste chat

Próximo cycle: `0818-c2-etapas-e-transicoes`.
