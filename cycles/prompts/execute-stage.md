# Prompt — Execute (copiar daqui para baixo)

Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `{CYCLE_PATH}`
**Tipo:** `{CYCLE_TYPE}`
**Escopo desta janela:** `{STAGE_OR_FLAT}`

## Missão

Executar **somente** o que está em `{CYCLE_PATH}/tasks.md` para o escopo acima.

## Ler nesta ordem

1. `AGENTS.md`
2. `{CYCLE_PATH}/request.md`
3. `{CYCLE_PATH}/plan.md`
4. `{CYCLE_PATH}/tasks.md`
5. `{CYCLE_PATH}/scenarios.feature`
6. `{CYCLE_PATH}/implementation-notes.md` (se existir)
7. Specs citadas no plan

## Regras

- Large: execute **uma stage**. Não comece a próxima.
- Medium: execute o `tasks.md` em ordem; não invente tasks.
- Siga padrões já existentes no repo (após C0). Não introduza generic repository, event sourcing, BPM, microserviços.
- `workspaceId` sai da sessão, nunca do body.
- Marque task `done` só com evidência (comando rodado).
- Atualize `implementation-notes.md` com decisões e desvios.
- Commits **somente** se eu escrever **"e faça os commits"**.
- Não atualize `spec/`. Não feche o cycle.

## Ao terminar

Resumo: o que entrou, comandos rodados, tasks done/blocked, o que falta para review.
