# CLOSURE.md — C7 Pendências / blockers

**Cycle:** `cycles/Q32026/0818-c7-pendencias/`  
**Tipo:** Medium  
**Status:** fechado  
**Data:** 2026-08-19

## Resumo

Pendência (Blocker) circunstancial, tabela distinta de Checklist. Máquina `open → resolved|cancelled`. Create na etapa atual auto-bloqueia. Complete rejeitado enquanto Blocker open bloquear a etapa/projeto. Resolve **não** avança etapa; só desbloqueia.

## Valor

Operador registra o que trava entrega (API key do cliente, domínio, etc.) e o board/ficha mostram o bloqueio, sem misturar com checklist previsto.

## O que o próximo cycle pode assumir

- `POST /api/blockers` e `POST /api/blockers/:id/decide` existem e são scoped à sessão
- `assigneeKind=internal` exige member; `client` grava `assigneeUserId` null
- `evaluateStageAction` rejeita complete com motivo `Há pendência em aberto bloqueando esta etapa`
- UI `/pendencias` e `/pendencias/:id` na nav; seção na ficha; pills no pipeline
- Events `blocker.opened` e `blocker.resolved`; cancel sem event
- `sourceMeetingId` nullable sem FK (C9)
- Sem Playwright; resolve não chama transition complete

## Não começar C8 neste chat

Próximo cycle: `0818-c8-lembretes`.
