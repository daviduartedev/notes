# implementation-notes.md — C11 Templates de workflow

Diário de execute. Medium, tasks flat.

## 19/08/2026 — início

- Catálogo de domínio com grafos lineares (landing 4, institutional 5, saas 10, app 5, ecommerce 5, maintenance 4).
- `isDefault` no Prisma; seed on-list por workspace.
- Create de projeto passa a exigir `workflowTemplateId`.
- UI `/workflows` formulário; sem canvas.

## 19/08/2026 — gates e fechamento

- `pnpm lint` / `typecheck` / `test` / `build` exit 0 (187 API + 29 web; `ƒ /workflows`).
- Pipeline: colunas SaaS + extras para keys de outros templates.
- Review/validate/update-spec/CLOSURE sem blockers. Roadmap C0–C11 encerrado.
