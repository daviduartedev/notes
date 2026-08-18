# spec/frontend.md

Web em `apps/web` (Next.js App Router + Tailwind), porta **3015**.

## Visual

- Canvas `#121212`, painel `#151515`, raised `#181818`
- Bordas discretas (`rgba(255,255,255,0.08)`)
- Semântica: verde / amarelo / vermelho / azul / roxo
- Títulos/labels: **Caveat**; UI: **IBM Plex Sans**

## Rotas C0

| Path | Quem | Comportamento |
|------|------|----------------|
| `/login` | visitante | layout de login |
| `/hoje` | autenticado | empty state “quadro ainda sem operação”; visitante → `/login` |
| `/design-system` | development | 404 em production |

Primitivos: Button, Input, Card, StatusPill. Sem board operacional no C0.

UI em **pt-BR**.
