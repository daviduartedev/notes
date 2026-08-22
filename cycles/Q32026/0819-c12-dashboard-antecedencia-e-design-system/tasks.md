# tasks.md — C12 Dashboard, antecedência e design system

> Large: stages numeradas. Mandato desta conversa: executar **todas** as stages para smoke no localhost.  
> Marcar `[x]` só com evidência (comando rodado).

## Stage 1 — Shell e nomenclatura

- [x] Nav `/hoje` e H1 da página operacional: **Dashboard** (coluna **Hoje** intacta)
- [x] Tokens `--page-gutter` / `--page-max` no AppShell; header com nav centrada no eixo horizontal
- [x] Copy de erro do quadro alinhada a Dashboard
- [x] Teste de copy web atualizado

## Stage 2 — Design system e primitivos

- [x] Dependência `lucide-react` em `apps/web`
- [x] Select/FilterBar: min-width; labels não truncam
- [x] Ícones lucide no shell/quadro (chevron, sino)
- [x] `/design-system` lista tokens, primitivos e ícones
- [x] Aplicar FilterBar nas listas com “Todos os responsáveis”

## Stage 3 — Antecedência + lembrete manual

- [x] Prisma: `Workspace.attentionLeadDays` default 3; migration
- [x] GET workspace inclui o campo; PATCH `/api/workspace` `{ attentionLeadDays }` (0–30); `workspaceId` ignorado
- [x] `buildHojeDashboard` + GET `/api/hoje`: reminder/meeting em 1…N dias UTC → `needs_attention` com `alert`
- [x] Input configurável na seção Precisa de atenção
- [x] `POST /api/reminders`: `draftMessage`, `dueAt`, `clientId`, `projectId`; `policyKey=manual`; 400 se projeto ≠ cliente
- [x] Form criar em `/lembretes` e na ficha do projeto
- [x] Testes HTTP + domínio; tenant B isolado

## Gates

- [x] `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`

## Fechamento do cycle

- [ ] Promover `spec-delta.md` via `/update-spec` (depois da validation)
