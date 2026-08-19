# Janelas de contexto — C3 Pipeline

**Pasta:** `cycles/Q32026/0818-c3-pipeline/`  
**Tipo:** Medium  
**Depende de:** C2 fechado  
**Status:** **fechado** (2026-08-19)

Abra um **chat novo** para cada janela. Cole o bloco. Padrão Elli: uma missão por contexto.

## Ordem

| # | Janela | Quando |
|---|--------|--------|
| 1 | Refine | dependência fechada |
| 2 | Execute | plan/tasks aprovados |
| 3 | Review | execute terminou |
| 4 | Validate | após review |
| 5 | Update spec | validation verde |
| 6 | Close cycle | spec promovida |
| — | Resume | chat novo no meio |

---

## 1. Refine

```text
Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `cycles/Q32026/0818-c3-pipeline`
**Tipo previsto:** Medium (confirmar no plan.md)

## Missão

REFINE-REQUEST no padrão Elli + Harness. **Não implemente** código, migrations, páginas, componentes, CI nem dependências.

## Ler nesta ordem

1. `AGENTS.md`
2. `cycles/README.md`
3. `cycles/Q32026/0818-c3-pipeline/request.md`
4. `CLOSURE.md` dos cycles anteriores já fechados, se existirem
5. `spec/` se já existir (após C0)

## Fazer

1. Se o request deixar decisões abertas, faça **uma única lista consolidada** de perguntas (produto, dados, UX, segurança, testes, rollout).
2. Depois das respostas (ou se o request já estiver fechado), gere nesta pasta:
   - `plan.md`
   - `tasks.md` (flat, em ordem)
   - `scenarios.feature` (`# language: pt`)
   - `spec-delta.md` (se specs mudam)
   - `implementation-notes.md` recomendado
3. Não edite `spec/` como verdade final.
4. Não avance para execute nesta janela.

Ao terminar: liste os arquivos criados e o que precisa de aprovação humana antes da Execute.
```

---

## 2. Execute

```text
Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `cycles/Q32026/0818-c3-pipeline`
**Tipo:** Medium
**Escopo desta janela:** tasks.md completo (flat)

## Missão

Executar **somente** o que está em `cycles/Q32026/0818-c3-pipeline/tasks.md` para o escopo acima.

Leia: `AGENTS.md`, `cycles/Q32026/0818-c3-pipeline/request.md`, `plan.md`, `tasks.md`, `scenarios.feature`, `implementation-notes.md`, specs citadas no plan.

Regras:
- Medium: execute o `tasks.md` em ordem. Não invente tasks.
- Siga o que já existe no repo. Sem generic repository, event sourcing, BPM, microserviços.
- `workspaceId` sai da sessão, nunca do body.
- Task `done` só com evidência (comando rodado).
- Atualize `implementation-notes.md`.
- Commits **somente** se eu escrever **"e faça os commits"**.
- Não atualize `spec/`. Não feche o cycle.

Ao terminar: resumo do que entrou, comandos, tasks done/blocked.
```

---

## 3. Review

```text
Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `cycles/Q32026/0818-c3-pipeline`
**Escopo revisado:** tasks.md completo (flat)

## Missão

Revisão **read-only**. Escreva `cycles/Q32026/0818-c3-pipeline/review.md`.

Confrontar código vs `request.md`, `plan.md`, `tasks.md`, `scenarios.feature`.

Verificar: escopo extra/faltando; regras de domínio (tenant, template≠instância, transições); IDOR; mass assignment; secrets/logs; testes dos cenários críticos; UX loading/empty/error/disabled/permission denied.

Findings: Blocker / Warning / Recommendation.
Não altere código salvo se eu pedir. Não avance stage nem feche cycle.
```

---

## 4. Validate

```text
Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `cycles/Q32026/0818-c3-pipeline`
**Escopo:** tasks.md completo (flat)

## Missão

Rodar gates de verdade e preencher `cycles/Q32026/0818-c3-pipeline/validation.md`. Nada de ✅ sem executar.

Gates (adaptar ao package.json): lint, typecheck, test, build, E2E se houver UI crítica, isolamento de workspace.

Mapeie cada cenário de `scenarios.feature` para evidência.
Não corrija fora de escopo. Não promova `spec/`.
```

---

## 5. Update spec

```text
Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `cycles/Q32026/0818-c3-pipeline`

Promova `cycles/Q32026/0818-c3-pipeline/spec-delta.md` para `spec/` **somente o que foi implementado e validado**.
Não documente intenção futura como fato. Não implemente feature nova.
```

---

## 6. Close cycle

```text
Você está no repositório `c:\dev\utopia\internal\notes`.

**Cycle ativo:** `cycles/Q32026/0818-c3-pipeline`

Checklist de fechamento (Elli CLOSURE + Harness):
- artefatos obrigatórios presentes
- spec atualizado se havia spec-delta
- validation verde ou baseline documentada
- escrever `cycles/Q32026/0818-c3-pipeline/CLOSURE.md` (resumo, valor, o que o próximo cycle pode assumir)

Não comece o próximo cycle. Commits só com **"e faça os commits"**.
```

---

## Resume

```text
Você está no repositório `c:\dev\utopia\internal\notes`. Chat novo / contexto resetado.

**Cycle:** `cycles/Q32026/0818-c3-pipeline`

Reancorar. **Não execute nada ainda.**

Leia request, plan, tasks, implementation-notes, review, validation, stage-summaries.

Responda: tipo; stage/task atual; o que está done com evidência; blocked; qual janela vem agora.
Espere eu confirmar.
```


Templates genéricos: `cycles/prompts/`.
