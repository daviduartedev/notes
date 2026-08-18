## Hard boundary

This command must not perform refinement.

It must only:

- create the cycle folder;
- copy the selected template;
- create or update `request.md`.

It must not fill real content into:

- `plan.md`
- `tasks.md`
- `scenarios.feature`
- `spec-delta.md`
- `implementation-notes.md`
- `validation.md`
- `review.md`

Those files must remain as placeholders copied from the template.

All real planning, task generation, scenario writing, spec-delta generation, risk analysis, file impact analysis, and technical decisions must be done later by `/refine-request`.

If the agent is about to write:
- Estado atual
- Estado-alvo
- Decisões
- Arquivos prováveis
- Riscos
- Cenários Gherkin
- Tasks executáveis

then it is doing `/refine-request` work and must stop.