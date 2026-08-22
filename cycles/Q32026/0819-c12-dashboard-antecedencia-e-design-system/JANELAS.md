# Janelas de contexto — C12 Dashboard, antecedência e design system

**Pasta:** `cycles/Q32026/0819-c12-dashboard-antecedencia-e-design-system/`  
**Tipo:** Large  
**Depende de:** C10 + C11 fechados  
**Status:** `request.md` pronto → execute sob mandato de smoke (todas as stages neste chat)

Abra um **chat novo** para cada janela. Cole o bloco. Padrão Elli: uma missão por contexto.

## Ordem

| # | Janela | Quando |
|---|--------|--------|
| 1 | Refine | agora |
| 2 | Execute Stage N | plan/tasks aprovados |
| 3 | Review Stage N | execute terminou |
| 4 | Validate Stage N | após review (ou junto se você mandar) |
| 5 | Close Stage N | validation da stage verde |
| 6 | Repetir 2–5 | próxima stage, só com seu ok |
| 7 | Update spec | todas as stages fechadas |
| 8 | Close cycle | spec promovida |
| — | Resume | qualquer chat novo no meio |

### Stages deste cycle

1. Stage 1 — Shell + nomenclatura
2. Stage 2 — Design system + primitivos
3. Stage 3 — Antecedência + lembrete manual

---

## 1. Refine

```text
Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `cycles/Q32026/0819-c12-dashboard-antecedencia-e-design-system`
**Tipo previsto:** Large (confirmar no plan.md)

## Missão

REFINE-REQUEST no padrão Elli + Harness. **Não implemente** código.

Leia: AGENTS.md, cycles/README.md, request.md deste cycle, spec/ citada.

Gere: plan.md, tasks.md (por stages), scenarios.feature, spec-delta.md, implementation-notes.md skeleton.
Não edite spec/ como verdade final.
```

---

## 2. Execute — Stage N

```text
Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `cycles/Q32026/0819-c12-dashboard-antecedencia-e-design-system`
**Tipo:** Large
**Escopo desta janela:** Stage N (só uma)

Executar somente as tasks da stage em tasks.md.
Commits somente com "e faça os commits".
Não atualize spec/.
```

---

## Resume

```text
Você está no repositório `c:\dev\utopia\internal\notes`. Chat novo.

**Cycle:** `cycles/Q32026/0819-c12-dashboard-antecedencia-e-design-system`

Reancorar. Não execute ainda. Responda tipo, stage/task, done com evidência, blocked, próxima janela.
```

Templates genéricos: `cycles/prompts/`.
