---
description: Record an architectural/technical decision in spec/decisions.md (ADR log) to fight drift
---

# Log decision

Append a durable record of a non-obvious technical or architectural decision to `spec/decisions.md`. This is the harness's **persistent organizational memory**: it survives context resets and prevents the agent from silently contradicting past decisions as the codebase grows.

> Use whenever a decision is made that a future agent (or human) might otherwise re-litigate, reverse by accident, or forget the reasoning behind.

## When to use

- A trade-off was chosen between two viable options.
- A constraint was accepted (library, pattern, boundary, performance budget).
- Something was deliberately deferred or ruled out.
- A convention was established that future code must follow.

Do NOT log trivia (variable names, formatting) — that belongs in `spec/code-style.md`.

## Instructions

1. If `spec/decisions.md` does not exist, create it with the header below.
2. Determine the next sequential ADR number (`ADR-NNNN`).
3. Append a new entry. Never edit or delete past entries — if a decision is reversed, add a **new** entry that supersedes the old one and update the old entry's status to `Superseded by ADR-NNNN`.
4. Link the originating cycle so the decision is traceable.
5. Report the ADR number created.

## File header (create once)

```md
# spec/decisions.md — Architecture Decision Log

> Append-only. Each entry is immutable. To reverse a decision, add a new
> entry that supersedes the old one; never delete history.
```

## Entry template

```md
---

## ADR-NNNN — <título curto da decisão>

- **Data:** YYYY-MM-DD
- **Cycle:** cycles/Q{q}{ano}/{MMDD}-{slug}/
- **Status:** Accepted | Superseded by ADR-NNNN | Deprecated

### Contexto
<o problema/forças que levaram à decisão>

### Decisão
<o que foi decidido, em uma ou duas frases>

### Alternativas consideradas
- <opção rejeitada> — <por que não>

### Consequências
<trade-offs aceitos, o que isso restringe ou habilita no futuro>
```

## Do not

- Editar ou apagar entradas anteriores (o log é append-only).
- Registrar como decisão algo que ainda não foi acordado com o humano.
- Duplicar conteúdo que pertence a um spec canônico — referencie em vez de copiar.
