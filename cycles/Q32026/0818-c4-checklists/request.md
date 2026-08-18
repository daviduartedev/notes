# request.md — Checklists (C4)

> **Ciclo:** `0818-c4-checklists`  
> **Tipo:** Medium  
> **Criado em:** 18/08/2026  
> **Path:** `cycles/Q32026/0818-c4-checklists/`  
> **Depende de:** C2 fechado  

---

## Contexto

Checklist é trabalho **previsto**. Não é pendência. Template ≠ instância: mutar o molde não corrompe histórico já executado.

---

## Objetivo

Aplicar template ao projeto/etapa, executar itens, garantir cópia independente.

---

## Escopo

- `ChecklistTemplate` + itens (por workspace)
- `ProjectChecklist` + `ChecklistItem` (deep copy na aplicação)
- Item: conclusão, responsável, observação, data, ordem
- Relacionar a projeto e/ou etapa; `validationId` nulo até C5
- Seed: “Deploy Staging SaaS” (environment, migrations, API keys sandbox, deploy, smoke tests, autenticação, fluxo principal, logs)
- `/checklists` + seção na ficha do projeto
- Events: `checklist.applied`, `checklist.item_completed`
- Checklist **não** muda `Stage.status` sozinho

---

## Fora de escopo

- Editor visual rico
- Checklist como blocker
- Sync bidirecional template → instâncias
- Engine genérica de templates além de checklist

---

## Critérios de aceite

- [ ] Aplicar o mesmo template em dois projetos; alterar o template depois; instâncias permanecem com os itens originais
- [ ] Marcar item registra responsável + `completedAt`
- [ ] IDOR em item de outro workspace

---

## Pontos que o refinamento deve esclarecer

- Quem edita templates: só `owner`?
- UI de gestão de templates neste cycle ou só seed + apply?

## Referências

- C2 (projeto/etapa)
