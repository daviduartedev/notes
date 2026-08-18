# Comandos do SDD Harness

Mapa de qual comando usar em cada etapa. Verdade canônica do fluxo: `spec/harness.md` e `spec/development-workflow.md`.

## Fluxo por tamanho de cycle

### Small
```
/scope-cycle (opcional) → /create-cycle → [implementar] → /execute-stage (modo flat)
  → /validate-cycle → /create-issue → /open-pr → /close-cycle
```

### Medium
```
/scope-cycle (opcional) → /create-cycle → /refine-request
  → /execute-stage (modo flat) → /review-implementation
  → /validate-cycle → /verify-cycle → /update-spec
  → /create-issue → /open-pr → /close-cycle
```

### Large
```
/scope-cycle → /create-cycle → /refine-request (tasks.md em stages)
  → por stage: /execute-stage → /review-implementation → /validate-cycle → /close-stage → [checkpoint humano]
  → /verify-cycle → /update-spec → /create-issue → /open-pr → /close-cycle
```

Após qualquer reset de contexto: `/resume-cycle` antes de tudo.
Sempre que uma decisão arquitetural for tomada: `/log-decision`.

## Comandos

| Comando | Faz | Não faz |
|---|---|---|
| `scope-cycle` | Transforma rascunho bruto em escopo classificado (Hotfix/Small/Medium/Large) | Não cria arquivos nem cycle |
| `create-cycle` | Cria a pasta do cycle e o `request.md` a partir do template | Não refina, não preenche artefatos |
| `refine-request` | Gera `plan.md`, `tasks.md`, `scenarios.feature`, `spec-delta.md` | Não promove specs, não implementa |
| `execute-stage` | Executa `tasks.md`: por stage (staged) ou tudo em ordem (flat) | Não avança stage sem aprovação |
| `review-implementation` | Revisa código vs escopo/specs (read-only) | Não altera código salvo se pedido |
| `validate-cycle` | Roda gates (lint/typecheck/test/build) e preenche `validation.md` | Não corrige fora de escopo |
| `verify-cycle` | Auditoria cética e independente: prova que cada cenário tem teste real | Não confia em autorrelato; não conserta código |
| `close-stage` | Fecha uma stage Large → `stage-summaries/stage-N.md` | Não promove specs, não inicia próxima stage |
| `update-spec` | Promove `spec-delta.md` validado para `spec/` | Não promove intenção não entregue |
| `close-cycle` | Checklist de artefatos por tamanho + sugestão de commit | Não fecha com falha crítica não documentada |
| `create-issue` | Cria issue no board Orbe via skill [orbe-soft/skills](https://github.com/orbe-soft/skills) (`gh` ou GitHub MCP) | Não gera `issue-*.md` local; não implementa código |
| `open-pr` | Abre PR no GitHub via skill `create-pr` (diff real, template Orbe) | Não gera `pr-*.md` local; não commita sem pedido explícito |
| `resume-cycle` | Reancora no cycle ativo após reset de contexto | Não retoma execução antes do resumo |
| `log-decision` | Registra decisão arquitetural em `spec/decisions.md` (ADR, append-only) | Não apaga histórico; não registra trivia |

## Regras-chave

- Toda mudança não trivial nasce em um cycle.
- `spec/` = verdade validada; `spec-delta.md` = proposta dentro do cycle. Promoção só via `/update-spec` após validação.
- Commits só com a frase explícita **"e faça os commits"**. Push e abertura de PR só com pedido explícito (**"e faça push"**, **"e abra os PRs"**).
Issue e PR no board Orbe **não** fazem parte desta execução (ORCH-009): push direto em `main` neste repositório. Os comandos `/create-issue` e `/open-pr` da casa não foram portados de propósito.
