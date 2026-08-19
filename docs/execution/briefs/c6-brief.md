# Brief — Cycle 06 Agent (Aprovações)

Cycle 06. Não pergunte. Não inicie C7+.

Workspace: `c:\dev\utopia\internal\notes`  
Cycle: `cycles/Q32026/0818-c6-aprovacoes/`  
Report: `docs/execution/reports/c6-report.md`

## Decisões

- D8: validação aprovada **não** cria Approval automaticamente
- `approverId` sempre da sessão (ignorar body)
- Estados: `pending→granted|rejected|cancelled`; `granted→revoked` (append-only, não apagar granted)
- Kinds: `proposal`, `scope`, `prototype`, `staging`, `production`, `final_acceptance`
- Snapshot server-side JSON: currentStageKey, projectStatus, validationId?, projectId, clientId
- **Não** avançar etapa ao grant neste cycle
- `validationId` opcional link

## Escopo

- Model Approval + transitions no domain
- `POST /api/approvals` create pending; `POST /api/approvals/:id/decide` grant/reject/cancel/revoke
- UI seção na ficha + `/aprovacoes` lista
- Events: `approval.granted`, `approval.rejected`, `approval.revoked`
- IDOR 404; sem Playwright

## Commit

`cycle(06): approvals`

Retorno: STATUS, SHA, gates, report path, ≤10 linhas.
