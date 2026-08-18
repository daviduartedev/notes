# spec/harness.md — Conceito do Harness

## O que é SDD

**Spec-Driven Development (SDD)** é um método onde toda mudança não trivial começa com uma especificação explícita do que deve ser feito, antes de qualquer implementação.

A especificação serve como:
- Contrato entre humano e agente
- Critério de aceite observável
- Fonte de verdade para revisão e validação
- Base para atualização de specs canônicas

---

## O que é o Harness

**Harness = SDD + comandos + regras + templates + gates + validação + checkpoints**

Neste repositório:
- Cycles: `cycles/Q{T}{ano}/{MMDD}-cN-slug/`
- Specs canônicas: `spec/`
- Comandos: `.cursor/commands/` (espelho do harness da casa)
- Entrypoint de agentes: `AGENTS.md`

---

## Artefatos de um cycle

| Artefato | Propósito |
|---|---|
| `request.md` | Intenção: o que precisa ser feito e por quê |
| `plan.md` | Plano delta |
| `tasks.md` | Tarefas executáveis com status |
| `scenarios.feature` | Aceite observável (Gherkin, `# language: pt`) |
| `spec-delta.md` | Proposta de mudança nas specs canônicas |
| `validation.md` | Evidências dos gates |
| `review.md` | Revisão da implementação |
| `implementation-notes.md` | Diário técnico (Large obrigatório) |
| `stage-summaries/stage-N.md` | Fechamento de stage (Large) |
| `CLOSURE.md` | Fechamento do cycle |

---

## `spec/` vs `spec-delta.md`

- `spec/` = verdade canônica do que foi **implementado e validado**
- `spec-delta.md` = proposta **dentro de um cycle**, ainda não promovida
- Promoção só via `/update-spec`, após validação

---

## Tipos de cycle

| Tipo | Quando | Artefatos |
|------|--------|-----------|
| Small | Mudança simples | request, tasks, validation |
| Medium | Complexidade moderada | + plan, scenarios, spec-delta |
| Large | Multi-stage | todos, inclusive implementation-notes e stage-summaries |

Large: uma stage por vez. Checkpoints humanos podem ser suspensos por mandato de execução (ORCH-001); os `stage-summaries/` continuam obrigatórios.

---

## Política de commits

Commits só com **"e faça os commits"** ou mandato equivalente (ORCH-002). Nunca commitar `.env`, secrets, `node_modules`, builds.

---

_Harness version: 1.0.0 — Notes_
