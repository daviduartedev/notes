# review.md — C10 Hoje / dashboard operacional

Revisão do cycle completo (tasks flat). Data: 2026-08-19.

## Blockers

Nenhum.

## Warnings

- O mesmo card/fato pode aparecer em mais de uma seção (ex.: projeto overdue também em `in_progress`; follow-up due também em `waiting_client`). Documentado em C10-D10.
- Approval só entra em `needs_attention` depois de 3 dias pendente; pending fresco não aparece.

## Suggestions

- C11 (templates de workflow) é pós-MVP e não é necessário para operar `/hoje`.
- Índices extras não foram necessários; listagens já filtram por `workspaceId`.

## Escopo

Sem BI, widgets, IA, WhatsApp, tabela de dashboard, Playwright. `workspaceId` só da sessão. C9 reuniões do dia entram em `today`. Tenant B: quatro seções vazias.
