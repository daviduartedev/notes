# plan.md — Reuniões (C9)

> **Ciclo:** `0818-c9-reunioes`  
> **Tipo:** Medium (tasks flat)  
> **Data:** 19/08/2026  
> **Branch:** `main` (ORCH-009)  
> **Depende de:** C1 + C2 fechados; C5 e C7 no disco

---

## Resumo

Registrar reunião com título, tipo, horário, participantes do workspace, notas, decisões e próximos passos. Vínculos opcionais a cliente, projeto, etapa e validação. Lista `/reunioes`. Event `meeting.created`. Reunião **não** altera etapa e **não** gera Blocker.

## Diagnóstico — estado atual (C8)

| Área | Estado |
|------|--------|
| Prisma | Sem modelo Meeting; `Blocker.sourceMeetingId` já nullable sem FK |
| API | `GET /api/meetings` 404 de roteador |
| Domínio | Tipos de reunião inexistentes |
| Web | Nav sem Reuniões; ficha sem seção |
| Testes | Vitest; Playwright proibido (ORCH-008) |

## Decisões de produto (refinamento — fechadas; nenhuma pergunta ao humano)

| # | Tópico | Decisão | Fonte |
|---|--------|---------|--------|
| C9-D1 | Lista | `/reunioes` + `/reunioes/:id` neste Medium | brief |
| C9-D2 | Tipos | `kickoff`, `scope_alignment`, `prototype_review`, `staging_validation`, `production_validation`, `delivery` | brief |
| C9-D3 | validationId | Opcional; C5 existe — link se a validação for do mesmo workspace (e do projeto/cliente quando informados) | brief |
| C9-D4 | Participantes | Array de userIds do workspace; IDs externos → 400 `Participante fora do workspace` | brief |
| C9-D5 | Blockers | Não gerar automaticamente; `sourceMeetingId` permanece no Blocker sem FK | brief |
| C9-D6 | Event | `meeting.created` no projeto (ou no cliente se só `clientId`); payload sem notas/decisões | brief |
| C9-D7 | Etapa | Create/PATCH **não** mutam `Stage.status` nem `currentStageId` | brief |
| C9-D8 | Fichas | Seção Reuniões em `/projetos/:id` e `/clientes/:id` | brief |
| C9-D9 | Âncora | Exigir `projectId` ou `clientId`; se ambos, `clientId` deve bater com o projeto | default |
| C9-D10 | stageId | Só com `projectId`; etapa do mesmo projeto | default |
| C9-D11 | CRUD | POST create, GET list/get/nested, PATCH conteúdo; sem DELETE neste cycle | default |
| C9-D12 | PATCH | title/type/startsAt/participantes/notas/decisões/próximos passos; ignora `workspaceId` e vínculos | default |
| C9-D13 | Isolamento | GET/PATCH outro tenant → 404 vazio; collection → `[]` | ORCH-006 |
| C9-D14 | workspaceId | Só da sessão; body ignorado | ouro |
| C9-D15 | Quem muta | Qualquer `member`/`owner` | default C2 |
| C9-D16 | Playwright | Proibido; aceite via Vitest + guard de rota | ORCH-008 |
| C9-D17 | Calendar | Fora | request |
| C9-D18 | Ata rica | Notas/decisões/próximos passos como texto | request |
| C9-D19 | lastInteraction | `meeting.created` entra nas ações que tocam `lastInteractionAt` | default C8 |
| C9-D20 | Nested GET | `GET /api/projects/:id/meetings` e `GET /api/clients/:id/meetings` | C5/C8 paralelo |

Perguntas do `request.md` (lista `/reunioes`; ligar `validationId`) estão **todas respondidas**. Checkpoints humanos suspensos (ORCH-001).

## Arquitetura alvo

```text
apps/api/src/domain/meeting-type.ts      tipos + validação de participantes
apps/api/src/meetings/schema.ts          Zod
apps/api/src/meetings/dto.ts             serialize
apps/api/src/meetings/routes.ts          HTTP
apps/api/src/store                       memory + prisma
apps/web/src/app/reunioes                lista + ficha
apps/web/src/components/project-meetings seção na ficha
apps/web/src/components/client-meetings  seção na ficha do cliente
```

Contratos:

```text
POST /api/meetings
GET  /api/meetings                        filtros type/projectId/clientId/validationId
GET  /api/meetings/:id                    404 IDOR
PATCH /api/meetings/:id                   conteúdo; 404 IDOR
GET  /api/projects/:id/meetings           404 IDOR no projeto
GET  /api/clients/:id/meetings            404 IDOR no cliente
```

- Auth: 401 sem sessão; 403 sem membership.
- Collection outro tenant → `[]`.
- `workspaceId` no body ignorado.

## Tasks (flat)

1. Domínio: tipos + rejeitar participantes externos.
2. Prisma Meeting + store memory/prisma.
3. HTTP CRUD + testes (ficha/histórico, participantes, etapa intacta, IDOR, collection).
4. Persistência Postgres (`persist-c9.test.ts`, skip sem `DATABASE_URL`).
5. UI fichas + `/reunioes` + `/reunioes/:id` + nav + middleware.
6. Gates lint/typecheck/test/build.

## Fora de escopo

Google Calendar, gerar validações/tarefas/blockers automaticamente, ata tipo Notion, `/hoje` operacional (C10), Playwright, C10+.

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Mutar etapa por engano | Teste explícito de `currentStageKey`/`Stage.status` após create |
| IDs de outro tenant como participante | `memberExists` por id; 400 com reason |
| PII em notas no activity | Payload só com ids/tipo/título |

## Gates

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`  
Playwright: n/a (ORCH-008)
