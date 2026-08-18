# request.md — Pipeline (C3)

> **Ciclo:** `0818-c3-pipeline`  
> **Tipo:** Medium  
> **Criado em:** 18/08/2026  
> **Path:** `cycles/Q32026/0818-c3-pipeline/`  
> **Depende de:** C2 fechado  
> **Libera:** C10 (seção projetos em andamento)

---

## Contexto

C2 já tem etapa atual e transições. Falta o quadro visual da evolução dos projetos.

---

## Objetivo

`/pipeline` mostra cada projeto na coluna da etapa atual.

---

## Escopo

- Board read-mostly agrupado por `currentStage.key` (ou phase, decidir no refine)
- Card: cliente, projeto, responsável, prazo, status visual (overdue / blocked / waiting)
- Filtros: responsável, cliente, prioridade
- Clique no card → `/projetos/:id`
- `GET /api/pipeline` scoped ao workspace
- **Drag-and-drop:** só se a transição for a mesma API do C2; senão snap-back. Se o refine classificar drag como Large, **este cycle fica click-only**.

---

## Fora de escopo

- Editar template
- `/hoje`
- Permitir coluna inválida “para facilitar”

---

## Critérios de aceite

- [ ] Dois projetos em etapas diferentes aparecem cada um só na coluna certa
- [ ] Membro de outro workspace não vê os cards
- [ ] Mover (se houver drag) chama a transition do C2; ilegal não persiste

---

## Pontos que o refinamento deve esclarecer

- Colunas por `key` fino vs por `phase`
- Incluir drag neste Medium ou adiar

## Referências

- C2 `request.md` / `plan.md`
