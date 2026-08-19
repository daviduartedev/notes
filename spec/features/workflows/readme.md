# spec/features/workflows/readme.md

CRUD de **WorkflowTemplate** + **StageTemplate** em formulário. Sem editor BPM nem canvas.

Template ≠ instância: na criação do projeto as etapas são copiadas (C2). Mutar o molde **não** reescreve projetos já instanciados.

## Catálogo seed (por workspace)

| key | Nome | Default | Etapas |
|-----|------|:-------:|--------|
| `landing` | Landing | não | Briefing → Design → Desenvolvimento → Publicação |
| `institutional` | Institucional | não | Briefing → Conteúdo → Design → Desenvolvimento → Publicação |
| `saas_delivery` | SaaS delivery | **sim** | 10 etapas C2 |
| `app` | App | não | Discovery → UX → Desenvolvimento → Testes → Loja |
| `ecommerce` | E-commerce | não | Catálogo → Design → Integração → Homologação → Go-live |
| `maintenance` | Manutenção | não | Triagem → Correção → Validação → Entrega |

Grafos lineares. Keys em inglês; labels em português. `isDefault` único por workspace (seed marca SaaS).

## Auth

- GET lista e GET por id: `member` e `owner`
- POST/PATCH/DELETE: só `owner` (member → 403)
- Catálogo seed: DELETE → 409. Template com projetos: 409. Custom sem projetos: 204
- Key imutável após create

## API

| Método | Path | Notas |
|--------|------|-------|
| GET | `/api/workflow-templates` | seed on-list; tenant B não vê ids de A |
| POST | `/api/workflow-templates` | owner; body `key`, `name`, `isDefault?`, `stages[]` |
| GET | `/api/workflow-templates/:id` | 404 IDOR |
| PATCH | `/api/workflow-templates/:id` | owner; pode substituir `stages` |
| DELETE | `/api/workflow-templates/:id` | owner; 409 catálogo/em uso |

`POST /api/projects` exige `workflowTemplateId` do workspace da sessão. Ausente → 400. Outro workspace → 404 vazio.

## Web

`/workflows` — owner edita em formulário (key, label, phase, critérios). Member vê copy de permissão. Create de projeto tem seletor obrigatório (default pré-selecionado).

## Pipeline

Colunas SaaS permanecem. `currentStage.key` de outros templates vira coluna extra no board.
