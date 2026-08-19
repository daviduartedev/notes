# CLOSURE.md — C8 Lembretes e follow-ups

**Cycle:** `cycles/Q32026/0818-c8-lembretes/`  
**Tipo:** Medium  
**Status:** fechado  
**Data:** 2026-08-19

## Resumo

Reminder interno (`channel=internal`) com rascunho, copiar, marcar enviado e adiar. Política nomeada `proposalWaitingClientFollowUp`: projeto em `waiting_client` + 3 dias sem interação → cria Reminder on-read. Relógio injetável. Nada é enviado para fora.

## Valor

Operador vê follow-up da proposta parada sem depender de WhatsApp ou calendário; o rascunho fica no sistema.

## O que o próximo cycle pode assumir

- `GET /api/reminders` avalia políticas e lista; collection de outro tenant `[]`
- `POST /api/reminders/:id/decide` `complete|snooze|cancel`; snooze → scheduled +7d
- `lastInteractionAt` em Client e Project atualizado em events relevantes
- UI `/lembretes` e `/lembretes/:id` na nav; seção na ficha
- Events `reminder.created` e `reminder.completed` sem texto do draft
- Sem Playwright; sem envio externo

## Não começar C9 neste chat

Próximo cycle: `0818-c9-reunioes`.
