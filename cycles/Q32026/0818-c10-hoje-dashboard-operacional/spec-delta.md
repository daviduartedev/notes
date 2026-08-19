# spec-delta.md — C10 Hoje / dashboard operacional

Proposta. Promoção para `spec/` só após validação (`/update-spec`).

## Novos arquivos canônicos

| Arquivo | Conteúdo proposto |
|---------|-------------------|
| `spec/features/hoje/readme.md` | Quadro operacional: 4 seções, card, limite 20, read model |

## Alterações em specs globais

| Arquivo | Mudança |
|---------|---------|
| `spec/README.md` | Índice: Hoje operacional (fecha MVP) |
| `spec/backend.md` | Contrato `GET /api/hoje` |
| `spec/frontend.md` | `/hoje` deixa de ser empty state; 4 colunas |
| `spec/security.md` | Collection `/api/hoje`: tenant B seções vazias |
| `spec/testing.md` | Fixture de seções + isolamento B |
| `spec/decisions.md` | ADRs C10-D1–D18 |

## Comportamento a documentar como fato só se entregue

- Quatro seções no GET e na UI
- Limite 20
- Evaluate on-read de lembretes
- Reuniões do dia (C9) na seção Hoje
- Empty copy por seção

## Promovido em 2026-08-19

Delta do C10 foi incorporado em `spec/` (feature hoje operacional, contrato GET /api/hoje, ADRs 0029–0030). Itens não entregues permanecem fora de `spec/` como fato: BI, widgets, IA, WhatsApp, Playwright, C11.

