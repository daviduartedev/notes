# plan.md — Templates de workflow (C11)

> **Ciclo:** `0818-c11-templates-de-workflow`  
> **Tipo:** Medium (tasks flat; reusa cópia de etapas do C2)  
> **Data:** 19/08/2026  
> **Branch:** `main` (ORCH-009)  
> **Depende de:** C2 (C10 SHA `66e4991` no disco)  
> **Pós-MVP** — último cycle desta execução

---

## Resumo

CRUD de `WorkflowTemplate` + `StageTemplate` (formulário, sem canvas/BPM). Catálogo seedado por workspace: Landing, Institucional, SaaS (já existe, default), App, E-commerce, Manutenção. `POST /api/projects` exige `workflowTemplateId` do workspace da sessão. Mutar o molde não reescreve instâncias (C2). Owner edita; member só lista e escolhe no create.

## Diagnóstico — estado atual (C10)

| Área | Estado |
|------|--------|
| API | Create de projeto sempre copia `saas_delivery`; sem CRUD de template |
| Domínio | Só o grafo SaaS em `saas-delivery-template.ts` |
| Web | Create de projeto sem seletor de template; sem `/workflows` |
| Dados | `WorkflowTemplate` / `StageTemplate` no Prisma; unique `(workspaceId, key)` |
| Testes | Vitest; Playwright proibido (ORCH-008) |

## Decisões de produto (refinamento — fechadas; nenhuma pergunta ao humano)

| # | Tópico | Decisão | Fonte |
|---|--------|---------|--------|
| C11-D1 | Grafos | Lineares 4–8 etapas; keys EN, labels PT | brief |
| C11-D2 | Landing | Briefing → Design → Desenvolvimento → Publicação | brief |
| C11-D3 | Institucional | Briefing → Conteúdo → Design → Desenvolvimento → Publicação | brief |
| C11-D4 | SaaS | Não duplicar `saas_delivery`; `isDefault=true` | brief |
| C11-D5 | App | Discovery → UX → Desenvolvimento → Testes → Loja | brief |
| C11-D6 | E-commerce | Catálogo → Design → Integração → Homologação → Go-live | brief |
| C11-D7 | Manutenção | Triagem → Correção → Validação → Entrega | brief |
| C11-D8 | Create | `workflowTemplateId` obrigatório; 400 se ausente; 404 se outro workspace | brief |
| C11-D9 | Instância | Deep copy C2; PATCH do molde não altera projetos já criados | request |
| C11-D10 | Auth | GET lista: member+owner. POST/PATCH/DELETE: só owner (403 member) | brief |
| C11-D11 | UI | `/workflows` (owner); member vê copy de permissão; seletor no create | brief |
| C11-D12 | Canvas | Recusar BPM/canvas; formulário de etapas (key, label, phase, order, critérios) | brief |
| C11-D13 | Delete | Catálogo seed: 409. Com projetos: 409. Custom sem projetos: 204 | default |
| C11-D14 | Default | Um `isDefault` por workspace; seed marca SaaS; owner pode trocar | brief |
| C11-D15 | Pipeline | Colunas SaaS permanecem; keys de outros templates viram colunas extras | compat C3 |
| C11-D16 | Isolamento | GET `/:id` outro tenant → 404; collection B não lista templates de A | ORCH-006 |
| C11-D17 | Playwright | Proibido; aceite via domínio + HTTP + copy/guard | ORCH-008 |
| C11-D18 | Key | Imutável após create; unique `(workspaceId, key)` | C2 |

Perguntas do `request.md` (grafos; owner-only) estão **todas respondidas**. Checkpoints humanos suspensos (ORCH-001).

## Arquitetura alvo

```text
apps/api/src/domain/workflow-catalog.ts     6 grafos seed
apps/api/src/workflows/seed.ts              ensure catalog por workspace
apps/api/src/workflows/routes.ts            CRUD /api/workflow-templates
apps/web/src/app/workflows/page.tsx         owner CRUD
apps/web/src/components/project-create-form.tsx  select obrigatório
```

Contrato:

```text
GET    /api/workflow-templates
POST   /api/workflow-templates          owner
GET    /api/workflow-templates/:id
PATCH  /api/workflow-templates/:id      owner
DELETE /api/workflow-templates/:id      owner
POST   /api/projects                    body.workflowTemplateId obrigatório
```

## Tasks (flat)

1. Catálogo de domínio + testes dos 6 grafos.
2. Prisma `isDefault` + seed dos tipos; `project.create` exige template do workspace.
3. HTTP CRUD owner-only + testes Landing ≠ SaaS + instância imutável + tenant B.
4. Persistência Postgres (`persist-c11.test.ts`).
5. UI `/workflows` + seletor no create; pipeline colunas extras.
6. Gates lint/typecheck/test/build.

## Fora de escopo

Editor visual / BPM, recálculo de projetos antigos, marketplace entre workspaces, Playwright.

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Vazamento A→B | GET por id 404; collection B sem ids de A |
| Create sem template quebra testes C1–C10 | Helper `workflowTemplateIdOf` + seed on-list |
| Landing some do pipeline | Colunas extras por `currentStage.key` desconhecido |

## Gates

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`  
Playwright: n/a (ORCH-008)
