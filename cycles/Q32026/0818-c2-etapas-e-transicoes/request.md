# request.md — Etapas e transições (C2)

> **Ciclo:** `0818-c2-etapas-e-transicoes`  
> **Tipo:** Large  
> **Criado em:** 18/08/2026  
> **Path:** `cycles/Q32026/0818-c2-etapas-e-transicoes/`  
> **Depende de:** C1 fechado  
> **Libera:** C3–C9, C11  

---

## Contexto

C1 tem projeto com `status` envelope. Isso **não** é o pipeline. O pipeline vive em **etapas** com máquina de estados e grafo explícito.

Não construir BPM genérico. Um template seedado “SaaS delivery”. Instância ≠ template.

Este cycle fecha o slice vertical:

```text
login → workspace → cliente → projeto → etapa → ação → histórico
```

---

## Decisão proposta (D7)

Seed único no C2: template **SaaS delivery** com fases Comercial / Design / Desenvolvimento (chaves e arestas explícitas, alinhadas à spec de produto). Outros tipos (Landing, App, …) só no C11.

---

## Objetivo

Todo projeto nasce com etapas copiadas do template. Avançar só por transição válida. Histórico registra de/para.

---

## Escopo

### Stage 1 — Domínio

- `WorkflowTemplate`, `StageTemplate` (`key`, `phase`, `order`, `allowedNextKeys`, critérios entrada/saída texto)
- `Stage` instância; `Project.currentStageId`, `workflowTemplateId`
- `domain/`: `canTransition`, status de etapa (`pending|in_progress|waiting|blocked|completed|skipped`)
- Testes unitários da matriz (o coração do produto)

### Stage 2 — Persistência e API

- Ao criar projeto: transação copia stages; primeira etapa = current
- Backfill dos projetos do C1
- `POST /api/projects/:id/stages/:stageId/transition`
- Proibir PATCH genérico de `currentStageId`
- Events: `stage.started`, `stage.transitioned`, `stage.completed`

### Stage 3 — UI na ficha

- `/projetos/:id` seção Etapas (lista/board vertical; labels na linguagem manuscrita)
- Botões disabled se transição inválida, com motivo
- Estados visuais waiting / blocked / overdue

### Stage 4 — E2E

- Avançar etapa válida; rejeitar pulo ilegal; histórico de/para visível

---

## Fora de escopo

- Editor de workflow; múltiplos templates na UI
- Checklists/validações reais (critérios são texto do template)
- `/pipeline` (C3)
- Auto-aprovação; drag-and-drop

---

## Domain rules

- Transição só se aresta existir **e** status da etapa permitir
- Etapa `blocked` não completa
- Completar move o ponteiro para o sucessor permitido
- Mutar o seed depois **não** reescreve instâncias já criadas
- Uma etapa atual por projeto

---

## Critérios de aceite

- [ ] Projeto novo possui as etapas do template SaaS
- [ ] Tentativa de pular etapa é 4xx e não grava event de transição
- [ ] Histórico mostra Design → Desenvolvimento (exemplo) com payload
- [ ] Alterar o template seed não muda stages de projeto antigo (teste)

---

## Stages previstas

1. Domínio + testes da matriz  
2. Persistência + API + backfill  
3. UI ficha  
4. E2E  

---

## Pontos que o refinamento deve esclarecer

- Grafo exato das keys do seed (lista fechada no `plan.md`)
- Quem pode transicionar: qualquer `member` ou só responsável?
- Reabrir etapa `completed` neste cycle? **Proposta: não**

## Referências

- `cycles/Q32026/0818-c1-clientes-e-projetos/`
- Spec de produto (pipeline comercial/design/dev)
