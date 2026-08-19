# Hoje

`/hoje` é o quadro operacional da empresa (fecha o MVP). Quatro seções acionáveis, isoladas por workspace.

## Seções (`GET /api/hoje`)

| Key | Conteúdo |
|-----|----------|
| `needs_attention` | projeto `active` overdue; validação não terminal overdue; blocker `open` atrasado; approval `pending` stale (≥ 3 dias) |
| `today` | lembrete `due` no dia UTC; follow-up `proposalWaitingClientFollowUp` com status `due`; reunião com `startsAt` no mesmo dia UTC |
| `waiting_client` | etapa atual `waiting` ou key `waiting_client`; validação `requested`; blocker `open` `assigneeKind=client`; reminder da política de proposta `due` |
| `in_progress` | projetos `draft`/`active`/`on_hold` com etapa atual (mesmo conjunto do pipeline) |

Limite: **20 cards por seção**, ordenados por urgência (`since` crescente; in_progress pelo prazo do pipeline).

## Card

`id`, `kind`, `clientName`, `projectName`, `reason`, `since` (ISO), `nextAction` (label em português), `href` (deep-link).

Read model: sem tabela nova. `GET /api/hoje` avalia lembretes on-read (C8) e agrega listagens C3–C9.

Empty: arrays vazios na API; copy clara por coluna na UI, sem mock de métricas.

O mesmo fato pode aparecer em seções distintas. Workspace B recebe as quatro seções vazias.
