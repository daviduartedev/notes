# Prompt — Review implementation (copiar daqui para baixo)

Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `{CYCLE_PATH}`
**Escopo revisado:** `{STAGE_OR_FLAT}`

## Missão

Revisão **read-only** contra `request.md`, `plan.md`, `tasks.md` e `scenarios.feature`. Escreva `{CYCLE_PATH}/review.md`.

Não altere código salvo se eu pedir correção explícita.

## Verificar

- Escopo: algo extra? algo faltando?
- Domain rules do request (tenant, template≠instância, transições, etc.)
- Segurança: IDOR, mass assignment, secrets, logs
- Testes existem para os cenários críticos?
- UX: loading / empty / error / disabled / permission denied

Classifique findings: Blocker / Warning / Recommendation.

Não avance stage nem feche cycle.
