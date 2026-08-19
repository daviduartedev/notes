# review.md — C5 Validações

Revisão do cycle completo (tasks flat). Data: 2026-08-19.

## Blockers

Nenhum.

## Warnings

- `PATCH /api/validations/:id` ainda aceita campos de conteúdo em status terminal (não muda `status`). Alinhado o suficiente ao aceite; restrição “só não-terminal” ficou frouxa.
- `GET /api/approvals` não existe (404 de roteador); o aceite “não existe Approval” está coberto pela ausência de modelo/eventos, não por um contrato dedicado.

## Suggestions

- C6 deve criar entidade Approval sem reutilizar `Validation.status === approved`.
- Lista `/validacoes` é read-only além dos filtros; transições na ficha `/validacoes/:id`.

## Escopo

Sem Approval, sem avanço automático de etapa, sem portal/e-mail. `changes_requested` **não** altera `Stage.status`. `workspaceId` só da sessão. Playwright não entrou.
