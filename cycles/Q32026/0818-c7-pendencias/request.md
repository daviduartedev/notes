# request.md — Pendências / blockers (C7)

> **Ciclo:** `0818-c7-pendencias`  
> **Tipo:** Medium  
> **Criado em:** 18/08/2026  
> **Path:** `cycles/Q32026/0818-c7-pendencias/`  
> **Depende de:** C2 fechado  

---

## Contexto

Pendência é **circunstancial** e pode bloquear etapa ou projeto. Checklist é previsto. Não colapsar as duas.

Exemplos: API key Stripe produção (responsável: cliente); domínio não apontado (equipe interna).

---

## Objetivo

Abrir/resolver blocker; etapa não completa enquanto blocker `open` a bloquear.

---

## Escopo

- `Blocker`: título, projeto, responsável (interno | cliente), blocksStageId?, blocksProject, status `open|resolved|cancelled`, prazo, openedAt
- Invariante no `domain/` da transition C2: complete rejeitado se blocker open
- Opcional: auto `Stage.status=blocked` ao criar blocker que bloqueia a etapa atual (decidir no refine)
- Resolver **não** avança etapa; só desbloqueia
- `/pendencias` + filtros: responsável, bloqueando, atrasadas, cliente, projeto
- Indicador na ficha e no pipeline (se C3 já existir)
- Copy “aguardando cliente” quando responsável = cliente

---

## Fora de escopo

- Converter checklist incompleto em blocker automático
- Kanban genérico de tickets

---

## Critérios de aceite

- [ ] Blocker open em produção impede completar a etapa; resolve e a rejeição por esse motivo some
- [ ] Pendência ≠ item de checklist (tabelas distintas)

---

## Pontos que o refinamento deve esclarecer

- Auto-set `blocked` na etapa vs só rejeitar complete
- Responsável cliente: userId nulo + flag `assigneeKind=client`?

## Referências

- C2 transition
