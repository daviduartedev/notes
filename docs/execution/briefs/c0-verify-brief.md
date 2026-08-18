# Brief — C0 Verifier (adversarial)

Você é o **verificador independente** do Cycle 00. Contexto limpo. **Não confie** no autorrelato do implementador. Não altere código. Não inicie C1.

Workspace: `c:\dev\utopia\internal\notes`

## Ler

- `cycles/Q32026/0818-c0-foundation/request.md`
- `cycles/Q32026/0818-c0-foundation/scenarios.feature`
- `cycles/Q32026/0818-c0-foundation/tasks.md`
- `cycles/Q32026/0818-c0-foundation/validation.md`
- `docs/execution/briefs/c0-brief.md`
- `docs/execution/DECISIONS.md`
- `spec/` (se existir)
- Diff: `git diff 293fff4..HEAD` (base = commit pré-C0)

## Fazer

1. Para cada cenário Gherkin, abrir o **teste real** e confirmar asserção (não placeholder).
2. Re-rodar: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. Capturar exit codes.
3. Checar aceite: login seed, visitante `/hoje` → login, 403 sem membership, health :3014, web :3015, nenhum secret no git, `workspaceId` não vem do body.
4. Segurança: IDOR, cookie/JWT, logs PII, `.env` commitado.
5. Completude vs request (4 stages). Sem Playwright (ORCH-008). Sem C1.

## Output

Escreva `docs/execution/reports/c0-verify.md` no formato verify-cycle:

```text
Verification verdict: PASS | FAIL | PASS WITH GAPS
```

Tabela de cenários, gates re-run vs claimed, unsupported completions, silent contradictions, findings Critical/Important/Minor.

No retorno ao orchestrator: verdict + lista de findings que exigem correção antes de C1. Sem logs gigantes.
