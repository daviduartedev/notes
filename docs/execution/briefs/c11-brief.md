# Brief — Cycle 11 Agent (Templates de workflow)

Cycle 11 pós-MVP. Não pergunte.

Workspace: `c:\dev\utopia\internal\notes`  
Cycle: `cycles/Q32026/0818-c11-templates-de-workflow/`  
Report: `docs/execution/reports/c11-report.md`

## Objetivo

CRUD WorkflowTemplate + StageTemplate (formulário simples, owner only). Seeds adicionais além do SaaS C2.

## Templates a seedar (grafos lineares simples, 4–8 etapas cada)

- `landing` — Briefing → Design → Desenvolvimento → Publicação
- `institutional` — Briefing → Conteúdo → Design → Desenvolvimento → Publicação  
- `saas` — já existe (não duplicar; marcar default)
- `app` — Discovery → UX → Desenvolvimento → Testes → Loja
- `ecommerce` — Catálogo → Design → Integração → Homologação → Go-live
- `maintenance` — Triagem → Correção → Validação → Entrega

## Decisões

- `project.create` exige `workflowTemplateId` do workspace
- Editar template não altera instâncias existentes (teste)
- Owner edita; member só escolhe no create
- Sem editor BPM/canvas
- UI: `/configuracoes/workflows` ou `/workflows` (owner)

## Commit

`cycle(11): workflow templates`

Retorno: STATUS, SHA, gates, report path, ≤10 linhas.
