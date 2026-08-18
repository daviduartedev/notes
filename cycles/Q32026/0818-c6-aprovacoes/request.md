# request.md — Aprovações (C6)

> **Ciclo:** `0818-c6-aprovacoes`  
> **Tipo:** Medium  
> **Criado em:** 18/08/2026  
> **Path:** `cycles/Q32026/0818-c6-aprovacoes/`  
> **Depende de:** C2; recomendado após C5  
> **Decisão D8:** validação aprovada **não** cria aprovação automaticamente

---

## Contexto

Aprovação = **autorizar formalmente** o avanço (proposta, escopo, protótipo, staging, produção, aceite). Auditabilidade: quem, o quê, quando, observação, estado do projeto naquele momento.

---

## Objetivo

Registrar aprovação com snapshot server-side e histórico append-only (inclusive revoke).

---

## Escopo

- `Approval`: kind, subjectType/Id, validationId opcional, approverId da **sessão**, decidedAt, comment, projectSnapshot JSON, status
- Estados: `pending → granted|rejected|cancelled`; `granted → revoked` (não apagar o granted)
- UI: seção na ficha; lista `/aprovacoes` se couber no Medium
- Snapshot gerado no server (etapa atual, status do projeto, validationId)
- **Não** avançar etapa automaticamente, salvo se o refine definir regra explícita por `kind` chamando a transition do C2 **na mesma transação**

---

## Fora de escopo

- Assinatura digital, portal do cliente
- Fundir com Validation

---

## Critérios de aceite

- [ ] Approval `kind=staging` grava approver, timestamp e snapshot; Validation permanece entidade separada
- [ ] `approverId` ignorado se vier no body — usa sessão
- [ ] Revoke não apaga o registro granted original

---

## Pontos que o refinamento deve esclarecer

- granted dispara transition de etapa? **Proposta: não neste cycle**
- Kinds iniciais (proposta, escopo, prototipo, staging, producao, aceite_final)

## Referências

- C5, D8
