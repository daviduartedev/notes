# Janelas de contexto — C2 Etapas e transições

**Pasta:** `cycles/Q32026/0818-c2-etapas-e-transicoes/`  
**Tipo:** Large  
**Depende de:** C1 fechado  
**Status:** `CLOSURE.md` — cycle fechado

Abra um **chat novo** para cada janela. Cole o bloco. Padrão Elli: uma missão por contexto.

## Ordem

| # | Janela | Quando |
|---|--------|--------|
| 1 | Refine | agora (se a dependência já fechou) |
| 2 | Execute Stage N | plan/tasks aprovados |
| 3 | Review Stage N | execute terminou |
| 4 | Validate Stage N | após review (ou junto se você mandar) |
| 5 | Close Stage N | validation da stage verde |
| 6 | Repetir 2–5 | próxima stage, só com seu ok |
| 7 | Update spec | todas as stages fechadas |
| 8 | Close cycle | spec promovida |
| — | Resume | qualquer chat novo no meio |

### Stages deste cycle

1. Stage 1 — Domínio + matriz de transições
2. Stage 2 — Persistência + API + backfill
3. Stage 3 — UI da ficha
4. Stage 4 — E2E

---

## 1. Refine

```text
Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `cycles/Q32026/0818-c2-etapas-e-transicoes`
**Tipo previsto:** Large (confirmar no plan.md)

## Missão

REFINE-REQUEST no padrão Elli + Harness. **Não implemente** código, migrations, páginas, componentes, CI nem dependências.

## Ler nesta ordem

1. `AGENTS.md`
2. `cycles/README.md`
3. `cycles/Q32026/0818-c2-etapas-e-transicoes/request.md`
4. `CLOSURE.md` dos cycles anteriores já fechados, se existirem
5. `spec/` se já existir (após C0)

## Fazer

1. Se o request deixar decisões abertas, faça **uma única lista consolidada** de perguntas (produto, dados, UX, segurança, testes, rollout).
2. Depois das respostas (ou se o request já estiver fechado), gere nesta pasta:
   - `plan.md`
   - `tasks.md` (por stages, com gate humano)
   - `scenarios.feature` (`# language: pt`)
   - `spec-delta.md` (se specs mudam)
   - `implementation-notes.md` skeleton obrigatório
3. Não edite `spec/` como verdade final.
4. Não avance para execute nesta janela.

Ao terminar: liste os arquivos criados e o que precisa de aprovação humana antes da Execute.
```

---

## 2. Execute — Stage 1 — Domínio + matriz de transições

```text
Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `cycles/Q32026/0818-c2-etapas-e-transicoes`
**Tipo:** Large
**Escopo desta janela:** Stage 1 — Domínio + matriz de transições

## Missão

Executar **somente** o que está em `cycles/Q32026/0818-c2-etapas-e-transicoes/tasks.md` para o escopo acima.

Leia: `AGENTS.md`, `cycles/Q32026/0818-c2-etapas-e-transicoes/request.md`, `plan.md`, `tasks.md`, `scenarios.feature`, `implementation-notes.md`, specs citadas no plan.

Regras:
- Large: execute **somente esta stage**. Não comece a próxima.
- Siga o que já existe no repo. Sem generic repository, event sourcing, BPM, microserviços.
- `workspaceId` sai da sessão, nunca do body.
- Task `done` só com evidência (comando rodado).
- Atualize `implementation-notes.md`.
- Commits **somente** se eu escrever **"e faça os commits"**.
- Não atualize `spec/`. Não feche o cycle.

Ao terminar: resumo do que entrou, comandos, tasks done/blocked.
```

---

## 3. Review — Stage 1 — Domínio + matriz de transições

```text
Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `cycles/Q32026/0818-c2-etapas-e-transicoes`
**Escopo revisado:** Stage 1 — Domínio + matriz de transições

## Missão

Revisão **read-only**. Escreva `cycles/Q32026/0818-c2-etapas-e-transicoes/review.md`.

Confrontar código vs `request.md`, `plan.md`, `tasks.md`, `scenarios.feature`.

Verificar: escopo extra/faltando; regras de domínio (tenant, template≠instância, transições); IDOR; mass assignment; secrets/logs; testes dos cenários críticos; UX loading/empty/error/disabled/permission denied.

Findings: Blocker / Warning / Recommendation.
Não altere código salvo se eu pedir. Não avance stage nem feche cycle.
```

---

## 4. Validate — Stage 1 — Domínio + matriz de transições

```text
Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `cycles/Q32026/0818-c2-etapas-e-transicoes`
**Escopo:** Stage 1 — Domínio + matriz de transições

## Missão

Rodar gates de verdade e preencher `cycles/Q32026/0818-c2-etapas-e-transicoes/validation.md`. Nada de ✅ sem executar.

Gates (adaptar ao package.json): lint, typecheck, test, build, E2E se houver UI crítica, isolamento de workspace.

Mapeie cada cenário de `scenarios.feature` para evidência.
Não corrija fora de escopo. Não promova `spec/`.
```

---

## 5. Close stage — Stage 1 — Domínio + matriz de transições

```text
Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `cycles/Q32026/0818-c2-etapas-e-transicoes`
**Stage a fechar:** Stage 1 — Domínio + matriz de transições

Crie `cycles/Q32026/0818-c2-etapas-e-transicoes/stage-summaries/` se não existir e grave `stage-N.md` com: entrega, evidências, desvios, blockers, se a próxima stage pode começar.

Não inicie a próxima stage. Não faça update-spec. Não feche o cycle.
```

---

## 6. Stages seguintes

Reabra o bloco **Execute**, trocando o escopo para:

- `Stage 2 — Persistência + API + backfill`
- `Stage 3 — UI da ficha`
- `Stage 4 — E2E`

Depois Review → Validate → Close-stage da mesma stage. Não pule checkpoint.

Atalho Resume se o chat estourar:

```text
Você está no repositório `c:\dev\utopia\internal\notes`. Chat novo / contexto resetado.

**Cycle:** `cycles/Q32026/0818-c2-etapas-e-transicoes`

Reancorar. **Não execute nada ainda.**

Leia request, plan, tasks, implementation-notes, review, validation, stage-summaries.

Responda: tipo; stage/task atual; o que está done com evidência; blocked; qual janela vem agora.
Espere eu confirmar.
```

---

## 7. Update spec

```text
Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `cycles/Q32026/0818-c2-etapas-e-transicoes`

Promova `cycles/Q32026/0818-c2-etapas-e-transicoes/spec-delta.md` para `spec/` **somente o que foi implementado e validado**.
Não documente intenção futura como fato. Não implemente feature nova.
```

---

## 8. Close cycle

```text
Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `cycles/Q32026/0818-c2-etapas-e-transicoes`

Checklist de fechamento (Elli CLOSURE + Harness):
- artefatos obrigatórios presentes
- spec atualizado se havia spec-delta
- validation verde ou baseline documentada
- escrever `cycles/Q32026/0818-c2-etapas-e-transicoes/CLOSURE.md` (resumo, valor, o que o próximo cycle pode assumir)

Não comece o próximo cycle. Commits só com **"e faça os commits"**.
```


Templates genéricos: `cycles/prompts/`.
