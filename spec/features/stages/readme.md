# Etapas e transições

Template **SaaS delivery** seedado por workspace. Instância ≠ template: na criação do projeto as etapas são copiadas (key, phase, order, allowedNextKeys, label, critérios texto). Mutar o template depois **não** reescreve instâncias já copiadas.

Não há motor BPM. Envelope `Project.status` (C1) é distinto do pipeline de etapas.

## Grafo seed (`saas_delivery`)

| order | key | phase | allowedNextKeys | Label |
|------:|-----|-------|-----------------|-------|
| 1 | `briefing` | `commercial` | `proposal` | Briefing |
| 2 | `proposal` | `commercial` | `waiting_client` | Proposta |
| 3 | `waiting_client` | `commercial` | `kickoff` | Aguardando cliente |
| 4 | `kickoff` | `commercial` | `ux` | Kickoff |
| 5 | `ux` | `design` | `prototype` | UX |
| 6 | `prototype` | `design` | `design_handoff` | Protótipo |
| 7 | `design_handoff` | `design` | `development` | Handoff design |
| 8 | `development` | `development` | `staging` | Desenvolvimento |
| 9 | `staging` | `development` | `production` | Staging |
| 10 | `production` | `development` | — | Produção |

Status de etapa: `pending | in_progress | waiting | blocked | completed | skipped`.

## Transições

- Só se a aresta existir **e** o status da origem permitir.
- Etapa `blocked` não completa. `completed` não reabre neste cycle.
- Completar move `Project.currentStageId` para o sucessor (se houver).
- Quem transiciona: qualquer `member`/`owner` do workspace.
- Ações: `complete | block | unblock | wait`.

## API

| Método | Path | Notas |
|--------|------|-------|
| GET | `/api/projects/:id` | inclui `stages[]` com `actions` (enabled + reason pt-BR) |
| POST | `/api/projects/:id/stages/:stageId/transition` | body Zod `action` e/ou `to`; 409 ilegal; 404 IDOR |
| PATCH | `/api/projects/:id` | `currentStageId` **ignorado** |

Events no `ActivityEvent` do projeto: `stage.started`, `stage.transitioned` (`from`/`to`), `stage.completed`. 409 **não** grava event de transição.

## Web

`/projetos/:id` seção Etapas (board vertical, labels Caveat). Botões disabled com motivo. Visual waiting / blocked; overdue do C1 no cabeçalho.

Quadro transversal em `/pipeline` (C3). Completar item de checklist **não** muda `Stage.status` (C4).

## Fora deste cycle

Editor de workflow e outros tipos (C11). Validações, entidade Blocker.
