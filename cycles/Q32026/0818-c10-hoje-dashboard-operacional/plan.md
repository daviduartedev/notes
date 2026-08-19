# plan.md — Hoje / dashboard operacional (C10)

> **Ciclo:** `0818-c10-hoje-dashboard-operacional`  
> **Tipo:** Medium (tasks flat; aggregator reusa listagens C3–C9, sem tabela nova)  
> **Data:** 19/08/2026  
> **Branch:** `main` (ORCH-009)  
> **Depende de:** C3–C9 fechados (C9 SHA `fa9b7a9` no disco)  
> **Fecha o MVP**

---

## Resumo

Substituir o empty state de `/hoje` por quadro operacional com quatro seções acionáveis. `GET /api/hoje` é read model: agrega queries já existentes, avalia lembretes on-read (C8) e devolve no máximo 20 cards por seção. Workspace B vê seções vazias. Sem tabela nova. C9 fechou: reuniões de hoje entram na seção Hoje.

## Diagnóstico — estado atual (C9)

| Área | Estado |
|------|--------|
| API | `GET /api/hoje` 404 de roteador |
| Domínio | Sem aggregator de dashboard |
| Web | `/hoje` copy `quadro ainda sem operação` |
| Dados | Clientes, projetos, etapas, pipeline, validações, aprovações, blockers, lembretes, reuniões no disco |
| Testes | Vitest; Playwright proibido (ORCH-008) |

## Decisões de produto (refinamento — fechadas; nenhuma pergunta ao humano)

| # | Tópico | Decisão | Fonte |
|---|--------|---------|--------|
| C10-D1 | Seções | `needs_attention`, `today`, `waiting_client`, `in_progress` | brief |
| C10-D2 | Limite | 20 cards por seção, após ordenar por urgência (`since` crescente; in_progress = prazo do pipeline) | brief |
| C10-D3 | Card | `id`, `kind`, `clientName`, `projectName`, `reason`, `since` ISO, `nextAction` (label pt), `href` | brief + teste |
| C10-D4 | needs_attention | projeto `active` overdue; validação não terminal overdue; blocker `open` atrasado; approval `pending` stale (≥ 3d, mesmo limiar C8) | brief + C8 |
| C10-D5 | today | lembrete `due` no dia UTC de `now`; follow-up política `proposalWaitingClientFollowUp` com status `due`; reunião com `startsAt` no mesmo dia UTC | brief; C9 fechou |
| C10-D6 | waiting_client | união: etapa atual `waiting` **ou** key `waiting_client`; validação `requested`; blocker `open` `assigneeKind=client`; reminder política proposta `due` | brief |
| C10-D7 | in_progress | mesmos projetos do pipeline (`draft`/`active`/`on_hold` com etapa atual); reason = etapa atual | brief + C3 |
| C10-D8 | Read model | Sem tabela/migration; `listPipelineCards` + listagens C5–C9 em paralelo | brief |
| C10-D9 | Evaluate | `GET /api/hoje` avalia política de follow-up como `GET /api/reminders` | C8 |
| C10-D10 | Duplicidade | O mesmo fato pode aparecer em seções distintas (ex.: overdue também em in_progress). Dentro da seção, um card por `(kind, id)` | default |
| C10-D11 | Isolamento | Collection: B recebe as 4 seções **vazias**, nunca cards de A. `workspaceId` query/body ignorado | ORCH-006 |
| C10-D12 | Auth | 401 sem sessão; 403 sem membership | C3 |
| C10-D13 | Empty | Copy **por seção**, não mock de métricas. Quadro sempre com 4 colunas | brief |
| C10-D14 | Visual | Post-its leves, colunas, setas CSS; Caveat nos títulos; sem Excalidraw | C0 + brief |
| C10-D15 | Playwright | Proibido; aceite via domínio + HTTP + copy/guard | ORCH-008 |
| C10-D16 | Deep-links | projeto `/projetos/:id`; validação `/validacoes/:id`; blocker `/pendencias/:id`; approval `/aprovacoes/:id`; reminder `/lembretes/:id`; reunião `/reunioes/:id` | rotas C1–C9 |
| C10-D17 | Relógio | `deps.now()`; dia civil em UTC | C8 |
| C10-D18 | Índices | Nenhum novo; `workspaceId` já indexado nas tabelas usadas | default |

Perguntas do `request.md` (limite; reuniões se C9 aberto) estão **todas respondidas**. Checkpoints humanos suspensos (ORCH-001).

## Arquitetura alvo

```text
apps/api/src/domain/hoje-dashboard.ts    aggregator + limite 20
apps/api/src/hoje/routes.ts              GET /api/hoje
apps/api/src/reminders/evaluate.ts       extract do evaluate on-read C8
apps/web/src/components/hoje-board.tsx   4 colunas
apps/web/src/app/hoje/page.tsx           SSR via serverApi
```

Contrato:

```text
GET /api/hoje  → {
  needs_attention: HojeCard[],
  today: HojeCard[],
  waiting_client: HojeCard[],
  in_progress: HojeCard[]
}
```

## Tasks (flat)

1. Domínio do aggregator + testes de classificação/limite/empty.
2. HTTP `GET /api/hoje` + fixture + tenant B vazio.
3. Persistência Postgres (`persist-c10.test.ts`, skip sem `DATABASE_URL`).
4. UI `/hoje` quatro seções + copy por seção.
5. Gates lint/typecheck/test/build.

## Fora de escopo

BI, financeiro, widgets, IA, WhatsApp, C11 templates, Playwright, tabela de dashboard.

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Vazamento agregado A→B | Teste HTTP + persist: B com 4 arrays vazios |
| N+1 | Só listagens por workspace, sem loop por card |
| Follow-up invisível | Evaluate on-read antes de montar o quadro |

## Gates

`pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`  
Playwright: n/a (ORCH-008)
