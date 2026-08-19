# spec-delta.md — C11 Templates de workflow

**Promovido** em 2026-08-19 (update-spec). Verdade canônica em `spec/`.

Proposta original (histórico):

## Novos arquivos canônicos

| Arquivo | Conteúdo proposto |
|---------|-------------------|
| `spec/features/workflows/readme.md` | CRUD de templates, catálogo seed, owner vs member, UI `/workflows` |

## Alterações em specs globais

| Arquivo | Mudança |
|---------|---------|
| `spec/README.md` | Índice: workflows |
| `spec/backend.md` | CRUD `/api/workflow-templates`; `POST /api/projects` exige `workflowTemplateId` |
| `spec/frontend.md` | `/workflows`; seletor no create de projeto |
| `spec/database.md` | `WorkflowTemplate.isDefault`; seeds além de `saas_delivery` |
| `spec/security.md` | Member 403 em mutação; collection B sem templates de A; GET id 404 |
| `spec/testing.md` | Landing ≠ SaaS; instância imutável; create 400/404 |
| `spec/decisions.md` | ADRs C11-D1–D18 |
| `spec/features/stages/readme.md` | Vários templates; SaaS continua o default |
| `spec/features/projects/readme.md` | Create exige template do workspace |
| `spec/features/pipeline/readme.md` | Colunas SaaS + extras para keys de outros templates |

## Comportamento a documentar como fato só se entregue

- Seis tipos seedados; `saas_delivery` default, sem duplicar
- Deep copy na criação a partir do molde escolhido
- Owner CRUD em formulário; sem BPM/canvas
- Editar molde não reescreve instâncias
- Catálogo seed não se deleta; template com projetos → 409
