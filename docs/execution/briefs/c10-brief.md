# Brief — Cycle 10 Agent (Hoje / Dashboard MVP)

Cycle 10 — **fecha o MVP**. Não pergunte. Não inicie C11 neste agente.

Workspace: `c:\dev\utopia\internal\notes`  
Cycle: `cycles/Q32026/0818-c10-hoje-dashboard-operacional/`  
Report: `docs/execution/reports/c10-report.md`

## Objetivo

Substituir empty state de `/hoje` por quadro operacional com 4 seções acionáveis.

## Seções (`GET /api/hoje`)

1. **needs_attention** — overdue projeto, validação overdue, blocker open atrasado, approval pending stale
2. **today** — lembretes due hoje, follow-ups due, reuniões hoje (C9)
3. **waiting_client** — união explícita: etapa `waiting` ou `waiting_client` key; validation `requested`; blocker assigneeKind=client open; reminder proposal policy due
4. **in_progress** — projetos draft/active/on_hold com etapa atual (resumo)

Cada card: clientName, projectName, reason, since (ISO), nextAction (label), href (deep-link)

## Decisões

- Limite **20 cards por seção** (ordenar por urgência)
- Read model: queries agregadas, sem tabela nova
- Visual: post-its leves, colunas, setas — linguagem C0, sem Excalidraw
- Tenant B → todas seções vazias (nunca vazar A)
- Teste fixture com overdue + validation pending + client blocker + reminder due → cada um na seção certa
- Empty state por seção com copy clara

## Commit

`cycle(10): operational today dashboard`

Retorno: STATUS, SHA, gates, report path, ≤10 linhas.
