# Prompt — Validate cycle (copiar daqui para baixo)

Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `{CYCLE_PATH}`
**Escopo:** `{STAGE_OR_FLAT}`

## Missão

Rodar os gates de verdade e preencher `{CYCLE_PATH}/validation.md`.

Nada de ✅ sem executar. Falha nova ≠ falha baseline (documentar as duas).

## Gates (adaptar aos scripts do package.json após C0)

- lint
- typecheck
- testes unitários / integration do cycle
- build
- E2E se o cycle tiver fluxo de UI crítico
- teste de isolamento de workspace quando houver dados

Mapeie cada cenário de `scenarios.feature` para evidência (comando + resultado).

Não corrija fora de escopo. Não promova `spec/`.
