# spec-delta.md — C3 Pipeline

Proposta. Promoção para `spec/` só após validação (`/update-spec`).

## Novos arquivos canônicos

| Arquivo | Conteúdo proposto |
|---------|-------------------|
| `spec/features/pipeline/readme.md` | Board por `currentStage.key`, contrato GET, filtros, click-only |

## Alterações em specs globais

| Arquivo | Mudança |
|---------|---------|
| `spec/README.md` | Índice: pipeline |
| `spec/backend.md` | `GET /api/pipeline` |
| `spec/frontend.md` | Rota `/pipeline`; nav Pipeline |
| `spec/security.md` | Collection GET não vaza tenant B (colunas vazias) |
| `spec/testing.md` | Agrupamento por key; isolamento collection |
| `spec/decisions.md` | ADRs C3-D1–D15 (0015–0016) |
| `spec/features/stages/readme.md` | `/pipeline` deixou de ser “fora deste cycle” como fato futuro; aponta C3 |
| `spec/features/projects/readme.md` | Board operacional em `/pipeline` (envelope completed/cancelled fora) |

## Comportamento a documentar como fato só se entregue

- Colunas = 10 keys SaaS, sempre presentes
- Cards só `draft|active|on_hold` com etapa atual
- Filtros owner/client/priority
- Click → ficha; sem drag
- Workspace B não vê cards de A

## Não documentar como fato

Drag-and-drop, transicionar pelo board, `/hoje` operacional, editor de template, Playwright.

## Promovido em 2026-08-19

Delta do C3 foi incorporado em `spec/` (feature pipeline, contratos, ADRs 0015–0016). Itens não entregues permanecem fora de `spec/` como fato: drag-and-drop, transicionar pelo board, `/hoje` operacional.
