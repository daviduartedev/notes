# request.md — Templates de workflow (C11, pós-MVP)

> **Ciclo:** `0818-c11-templates-de-workflow`  
> **Tipo:** Medium  
> **Criado em:** 18/08/2026  
> **Path:** `cycles/Q32026/0818-c11-templates-de-workflow/`  
> **Depende de:** C2 (não bloqueia o MVP / C10)

---

## Contexto

C2 seedou um template SaaS. Precisamos de workflows diferentes (Landing, Institucional, SaaS, App, E-commerce, manutenção) **sem** editor BPM nem canvas drag-and-drop.

Template ≠ instância continua valendo.

---

## Objetivo

Ao criar projeto, escolher template do workspace. Etapas geradas pela cópia já existente no C2.

---

## Escopo

- CRUD de `WorkflowTemplate` + `StageTemplate` (formulário)
- Seeds dos tipos acima (grafos simples, explícitos)
- `project.create` exige `workflowTemplateId` do mesmo workspace
- Teste: projeto Landing ≠ projeto SaaS nas etapas
- Sem mutação em massa de projetos já instanciados

---

## Fora de escopo

- Editor visual / BPM
- Recalcular grafo de projetos antigos
- Marketplace de templates entre workspaces

---

## Critérios de aceite

- [ ] Criar projeto Landing e projeto SaaS gera conjuntos de etapas diferentes
- [ ] Editar template depois não altera instâncias já criadas
- [ ] Recusar pedido de canvas de fluxo neste cycle

---

## Pontos que o refinamento deve esclarecer

- Grafos iniciais de cada tipo (lista fechada no plan)
- Templates só `owner` edita?

## Referências

- C2 domínio de transição
