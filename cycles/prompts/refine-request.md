# Prompt — Refine request (copiar daqui para baixo)

Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `{CYCLE_PATH}`
**Tipo previsto:** `{CYCLE_TYPE}` (confirmar no `plan.md`)

## Missão

REFINE-REQUEST no padrão Elli + Harness. **Não implemente** código, migrations, páginas, componentes, CI nem dependências.

## Ler nesta ordem

1. `AGENTS.md`
2. `cycles/README.md`
3. `{CYCLE_PATH}/request.md`
4. `cycles/Q32026/*/request.md` dos cycles anteriores **já fechados** (CLOSURE.md), se existirem
5. `spec/` se já existir (após C0)

## Fazer

1. Se o `request.md` deixar decisões abertas, faça **uma única lista consolidada** de perguntas (produto, dados, UX, segurança, testes, rollout) — padrão Elli `/refine-request`.
2. Depois das respostas (ou se o request já estiver fechado), gere:

| Artefato | Small | Medium | Large |
|----------|:-----:|:------:|:-----:|
| `plan.md` | opcional | obrigatório | obrigatório |
| `scenarios.feature` | opcional | obrigatório | obrigatório (`# language: pt`) |
| `tasks.md` | flat | flat | **por stages**, com gate humano |
| `spec-delta.md` | se specs mudam | se specs mudam | se specs mudam |
| `implementation-notes.md` | — | recomendado | skeleton obrigatório |

3. Classifique small/medium/large e peça confirmação no `plan.md`.
4. **Não** edite `spec/` como verdade final.
5. **Não** avance para execute nesta janela.

## Cenários

- Aceite observável, não detalhe de implementação.
- Caminho feliz + erros importantes (auth, IDOR/tenant, transição inválida, empty).
- Português.

## Ao terminar

Liste os arquivos criados e o que precisa de aprovação humana antes da janela Execute.
