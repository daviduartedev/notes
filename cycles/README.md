# Cycles — Delivery OS

Artefatos SDD no padrão **Elli** (`C:\dev\orbesoft\elli\cycles`): uma pasta por cycle, `request.md` primeiro, refine gera o resto.

Trimestre: **Q3 2026**. Data de abertura do roadmap: **18/08/2026**.

## Como usar (janelas de contexto)

Abra um **chat novo** para cada janela. Não misture refine com execute.

1. Abra `cycles/Q32026/<slug>/JANELAS.md`.
2. Copie o bloco da janela atual (refine, execute, review, …).
3. Cole no chat novo. Espere aprovação humana antes da próxima janela.

Prompts genéricos (com placeholder): [`prompts/`](prompts/).

## Índice

| Cycle | Pasta | Tipo | Status | Próxima janela |
|-------|--------|------|--------|----------------|
| C0 | [0818-c0-foundation](Q32026/0818-c0-foundation/) | Large | **fechado** | — |
| C1 | [0818-c1-clientes-e-projetos](Q32026/0818-c1-clientes-e-projetos/) | Large | **fechado** | — |
| C2 | [0818-c2-etapas-e-transicoes](Q32026/0818-c2-etapas-e-transicoes/) | Large | **fechado** | — |
| C3 | [0818-c3-pipeline](Q32026/0818-c3-pipeline/) | Medium | **fechado** | — |
| C4 | [0818-c4-checklists](Q32026/0818-c4-checklists/) | Medium | **fechado** | — |
| C5 | [0818-c5-validacoes](Q32026/0818-c5-validacoes/) | Medium | **fechado** | — |
| C6 | [0818-c6-aprovacoes](Q32026/0818-c6-aprovacoes/) | Medium | **fechado** | — |
| C7 | [0818-c7-pendencias](Q32026/0818-c7-pendencias/) | Medium | **fechado** | — |
| C8 | [0818-c8-lembretes](Q32026/0818-c8-lembretes/) | Medium | **fechado** | — |
| C9 | [0818-c9-reunioes](Q32026/0818-c9-reunioes/) | Medium | **fechado** | — |
| C10 | [0818-c10-hoje-dashboard-operacional](Q32026/0818-c10-hoje-dashboard-operacional/) | Medium | **fechado** (fecha MVP) | — |
| C11 | [0818-c11-templates-de-workflow](Q32026/0818-c11-templates-de-workflow/) | Medium | **fechado** (fecha roadmap) | — |
| C12 | [0819-c12-dashboard-antecedencia-e-design-system](Q32026/0819-c12-dashboard-antecedencia-e-design-system/) | Large | **aberto** | Execute (smoke: stages 1–3) |

Ordem recomendada de execução: **C0 → C1 → C2 → C3 → C4 → C5 → C6 → C7 → C8 → C9 → C10 → C11 → C12**.

## Artefatos por cycle

| Arquivo | Quem cria | Quando |
|---------|-----------|--------|
| `request.md` | planejamento (já escrito) | agora |
| `JANELAS.md` | planejamento (já escrito) | agora |
| `plan.md` | agente na janela Refine | após perguntas |
| `tasks.md` | agente na janela Refine | após perguntas |
| `scenarios.feature` | agente na janela Refine | após perguntas |
| `spec-delta.md` | agente na janela Refine | se specs mudam |
| `implementation-notes.md` | Refine (skeleton) + Execute (diário) | Large obrigatório |
| `review.md` | janela Review | após execute |
| `validation.md` | janela Validate | após gates |
| `stage-summaries/stage-N.md` | janela Close-stage | Large |
| `CLOSURE.md` | janela Close-cycle | fim |

`spec/` só é atualizado na janela **update-spec**, depois de validation verde.

## Regras

- Large: **uma stage por vez**, checkpoint humano.
- Medium: execute o `tasks.md` em ordem (flat).
- Não avance cycle seguinte com o anterior aberto.
- Commits somente com **"e faça os commits"**.
