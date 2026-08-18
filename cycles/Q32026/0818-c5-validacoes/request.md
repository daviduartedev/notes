# request.md — Validações (C5)

> **Ciclo:** `0818-c5-validacoes`  
> **Tipo:** Medium  
> **Criado em:** 18/08/2026  
> **Path:** `cycles/Q32026/0818-c5-validacoes/`  
> **Depende de:** C2 fechado (C4 opcional para ligar checklist)  
> **Libera:** C6  

---

## Contexto

Validação = **verificar** algo antes de avançar. Não é aprovação formal (C6). Não assumir que “approved” na validação cria Approval.

Estados de domínio (código EN, UI pt-BR):

```text
draft → requested | cancelled
requested → in_review | cancelled
in_review → changes_requested | approved | rejected
changes_requested → in_review | cancelled
```

UI: rascunho, solicitada, em revisão, ajustes solicitados, aprovada, recusada, cancelada.

---

## Objetivo

Solicitar e conduzir validação até um estado terminal, com histórico.

---

## Escopo

- Entidade Validation: projeto, etapa?, tipo, responsável/revisor, solicitante, ambiente, status, datas, prazo, itens/obs, resultado
- Máquina no `domain/`; sem PATCH direto de `status`
- `/validacoes`, `/validacoes/:id`, seção na ficha
- Filtros: status, projeto, cliente, responsável, prazo
- Cor roxa para o estado de validação
- Events: requested, in_review, changes_requested, approved, rejected
- `changes_requested` **não** recua etapa sozinho

---

## Fora de escopo

- Entidade Approval (C6)
- Portal do cliente, e-mail, WhatsApp
- Avanço automático de etapa ao aprovar validação

---

## Critérios de aceite

- [ ] `in_review` → ajustes → `changes_requested` + activity; **não** existe Approval
- [ ] Transição ilegal rejeitada
- [ ] Prazo vencido não terminal = visual overdue
- [ ] Isolamento por workspace

---

## Pontos que o refinamento deve esclarecer

- Tipos iniciais (protótipo, staging, produção, funcionalidade, entrega)
- Ligar checklist do C4 neste cycle se C4 já fechou

## Referências

- Invariante: Validação ≠ Aprovação
