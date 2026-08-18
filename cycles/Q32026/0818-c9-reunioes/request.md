# request.md — Reuniões (C9)

> **Ciclo:** `0818-c9-reunioes`  
> **Tipo:** Medium  
> **Criado em:** 18/08/2026  
> **Path:** `cycles/Q32026/0818-c9-reunioes/`  
> **Depende de:** C1 + C2  

---

## Contexto

Reunião associada a cliente, projeto, etapa e/ou validação. Tipos: kickoff, alinhamento de escopo/protótipo, validação staging/produção, entrega.

Futuro: origem de tarefas/pendências — neste cycle só `sourceMeetingId` opcional se C7 já fechou.

---

## Objetivo

Registrar reunião com notas, decisões e próximos passos na ficha.

---

## Escopo

- `Meeting`: título, tipo, startsAt, participantes (IDs do workspace), notas, decisões, próximos passos
- Vínculos opcionais: clientId, projectId, stageId, validationId
- CRUD + seção na ficha; `/reunioes` se couber
- Event `meeting.created`
- Reunião **não** altera etapa sozinha

---

## Fora de escopo

- Google Calendar
- Gerar validações/tarefas automaticamente
- Ata rica tipo Notion

---

## Critérios de aceite

- [ ] Reunião de validação staging com uma decisão aparece na ficha + histórico
- [ ] Participantes de fora do workspace rejeitados

---

## Pontos que o refinamento deve esclarecer

- Lista `/reunioes` neste Medium ou só ficha?
- Ligar validationId se C5 fechado

## Referências

- C1, C2, C5 se existir
