# request.md — Clientes e Projetos (C1)

> **Ciclo:** `0818-c1-clientes-e-projetos`  
> **Tipo:** Large  
> **Criado em:** 18/08/2026  
> **Path:** `cycles/Q32026/0818-c1-clientes-e-projetos/`  
> **Depende de:** C0 fechado  
> **Libera:** C2

---

## Contexto

C0 entrega login, workspace e shell. Ainda não existe a entidade operacional do produto.

Cliente ≠ Projeto. Um cliente tem **N** projetos simultâneos. Toda mutação relevante gera histórico consultável (`ActivityEvent`), não só uma frase.

---

## Objetivo

Criar cliente, criar N projetos no mesmo cliente, abrir fichas, ver histórico de criação/edição — tudo isolado por workspace.

Slice neste cycle (sem etapas ainda):

```text
login → workspace → cliente → projeto → histórico
```

---

## Escopo

### Stage 1 — Clientes

- CRUD Cliente: nome, empresa, WhatsApp, e-mail, responsável interno, observações, status, último contato, próximo follow-up, createdAt
- `/clientes`, `/clientes/:id`
- Filtros simples: nome, responsável, status
- `workspaceId` só da sessão

### Stage 2 — Projetos

- CRUD Projeto: workspace, cliente, nome, descrição, responsável, status (envelope: `draft|active|on_hold|completed|cancelled`), data início, prazo, prioridade, progresso, observações
- `/projetos`, `/projetos/:id` (cabeçalho operacional; sem abas de checklist/validação)
- `/clientes/:id` lista os projetos do cliente
- Filtros: responsável, status, cliente, prazo, prioridade
- Transições de `Project.status` no domínio — não string livre

### Stage 3 — Activity log

- `ActivityEvent`: workspaceId, actorId, entityType, entityId, action (enum), payload JSON, createdAt
- Events: `client.created|updated`, `project.created|updated`, `project.status_changed`
- `GET` activity na ficha do cliente e do projeto

### Stage 4 — E2E do slice

- Login → criar cliente → dois projetos → histórico visível
- Teste cruzado: membro do workspace B não lê IDs do A

---

## Fora de escopo

- Etapas, pipeline, checklists, validações, aprovações, pendências, lembretes, reuniões
- `/hoje` preenchido (continua placeholder)
- Busca avançada
- Relação 1:1 cliente/projeto na UI

---

## Critérios de aceite

- [ ] Dois projetos no mesmo cliente aparecem em `/clientes/:id` e `/projetos`
- [ ] Histórico registra `project.created` duas vezes com payload consultável
- [ ] GET de projeto do workspace B por membro de A → 404 ou 403, sem payload
- [ ] `Project.status` rejeita transição inválida
- [ ] Prazo vencido em projeto `active` tem estado visual `overdue`

---

## Stages previstas

1. Clientes  
2. Projetos  
3. Activity log  
4. E2E + IDOR  

---

## Pontos que o refinamento deve esclarecer

- Status do cliente (valores exatos)
- 404 vs 403 no IDOR
- Progresso: campo manual neste cycle?
- WhatsApp: só string de contato (sim)

## Restrições

- Mass assignment: client não envia `workspaceId`, `createdAt`, `status` fora do schema
- Logs sem PII extra (telefone/e-mail)

## Referências

- `cycles/Q32026/0818-c0-foundation/`
- `AGENTS.md`
