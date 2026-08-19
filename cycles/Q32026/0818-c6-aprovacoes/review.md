# review.md — C6 Aprovações

Revisão do cycle completo (tasks flat). Data: 2026-08-19.

## Blockers

Nenhum.

## Warnings

- Ficha `/aprovacoes/:id` mostra o snapshot como JSON bruto (aceitável no Medium; não é portal do cliente).
- `POST /api/approvals` ignora `subjectType`/`subjectId` do body e força `project` + `projectId` (C6-D12).

## Suggestions

- C7+ não deve tratar grant como transition de etapa (C6-D7).
- Lista `/aprovacoes` é read-only além dos filtros; decisões na ficha `/aprovacoes/:id`.

## Escopo

Sem avanço automático de etapa, sem assinatura digital, sem portal. D8: `Validation.approved` **não** cria Approval. `workspaceId` e `approverId` só da sessão. Playwright não entrou.
