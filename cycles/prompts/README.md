# Prompts de janela — copiar daqui para baixo

Padrão Elli: um chat = uma missão. Textos canônicos genéricos abaixo; use o `JANELAS.md` do cycle ativo (já vem com o path preenchido).

| Ordem | Arquivo | Faz | Não faz |
|-------|---------|-----|---------|
| 1 | [refine-request.md](refine-request.md) | plan, tasks, scenarios, spec-delta | implementar |
| 2 | [execute-stage.md](execute-stage.md) | código da stage / tasks.md | pular stage; update-spec |
| 3 | [review-implementation.md](review-implementation.md) | review.md | alterar código salvo pedido |
| 4 | [validate-cycle.md](validate-cycle.md) | gates + validation.md | consertar fora de escopo |
| 5 | [close-stage.md](close-stage.md) | stage-summaries (Large) | iniciar próxima stage |
| 6 | [update-spec.md](update-spec.md) | promover spec-delta | documentar intenção não entregue |
| 7 | [close-cycle.md](close-cycle.md) | checklist + CLOSURE.md | fechar com falha crítica oculta |
| — | [resume-cycle.md](resume-cycle.md) | reancorar após chat novo | executar antes do resumo |

Large: 2 → 3 → 4 → 5, repetir por stage, depois 6 → 7.

Medium: 2 (flat) → 3 → 4 → 6 → 7.
