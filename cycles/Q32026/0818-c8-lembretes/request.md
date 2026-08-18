# request.md — Lembretes e follow-ups (C8)

> **Ciclo:** `0818-c8-lembretes`  
> **Tipo:** Medium  
> **Criado em:** 18/08/2026  
> **Path:** `cycles/Q32026/0818-c8-lembretes/`  
> **Depende de:** C1 + C2  

---

## Contexto

Follow-up interno primeiro. Sem WhatsApp. Preparar `channel=internal` para automação futura.

Primeira política (código nomeado, **não** engine WHEN/THEN):

```text
proposta aguardando cliente + 3 dias sem interação → criar Reminder
```

---

## Objetivo

Lembrete com ações: copiar mensagem, marcar enviado, adiar.

---

## Escopo

- `Reminder` polimórfico (subjectType/Id) + clientId/projectId denormalizados
- Estados: `scheduled → due → done|snoozed|cancelled`; snooze volta para scheduled
- UI: copiar draft, complete (“enviado”), snooze
- `lastInteractionAt` em cliente/projeto atualizado em events relevantes
- `evaluateFollowUpPolicies` com relógio injetável (job manual ou na listagem — sem worker complexo)
- Lista `/lembretes` e/ou seção na ficha
- Não logar o texto completo do draft (PII)

---

## Fora de escopo

- WhatsApp, e-mail, Google Calendar
- Motor genérico de automações
- `/hoje` (C10 consome estes dados)

---

## Critérios de aceite

- [ ] Política dos 3 dias cria reminder (teste com relógio fake)
- [ ] UI oferece copiar, marcar enviado, adiar
- [ ] Nada é enviado para fora do sistema

---

## Pontos que o refinamento deve esclarecer

- Avaliação: on-read da lista vs endpoint `POST /api/reminders/evaluate`
- Texto padrão da mensagem de follow-up da proposta

## Referências

- C1 clientes, C2 etapa waiting_client
