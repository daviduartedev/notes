# spec-delta.md — C9 Reuniões

Proposta. Promoção para `spec/` só após validação (`/update-spec`).

## Novos arquivos canônicos

| Arquivo | Conteúdo proposto |
|---------|-------------------|
| `spec/features/meetings/readme.md` | Tipos, contratos HTTP, participantes, sem mutar etapa |

## Alterações em specs globais

| Arquivo | Mudança |
|---------|---------|
| `spec/README.md` | Índice: reuniões |
| `spec/backend.md` | Contratos POST/GET/PATCH + nested |
| `spec/frontend.md` | `/reunioes`, `/reunioes/:id`; seção nas fichas; nav |
| `spec/database.md` | Modelo Meeting + enum MeetingType |
| `spec/security.md` | IDOR 404; collection vazia; participantes externos 400 |
| `spec/testing.md` | Ficha+histórico, participantes, etapa intacta, IDOR |
| `spec/decisions.md` | ADRs C9-D1–D20 (0027–0028) |
| `spec/features/projects/readme.md` | Seção Reuniões |
| `spec/features/clients/readme.md` | Seção Reuniões |
| `spec/features/activity/readme.md` | Event `meeting.created` |
| `spec/features/blockers/readme.md` | Reunião não gera Blocker; `sourceMeetingId` segue sem FK |
| `spec/features/validations/readme.md` | `validationId` opcional na Meeting |

## Comportamento a documentar como fato só se entregue

- Lista `/reunioes`
- Tipos fechados do brief
- Participantes só do workspace
- Reunião não muda etapa e não abre pendência

## Promovido em 2026-08-19

Delta do C9 foi incorporado em `spec/` (feature meetings, contratos, ADRs 0027–0028). Itens não entregues permanecem fora de `spec/` como fato: Google Calendar, geração automática de tarefas/validações/blockers, ata rica, `/hoje` operacional, Playwright, C10+.
