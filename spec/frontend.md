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
| `/hoje` | autenticado | empty state “quadro ainda sem operação”; visitante ou JWT inválido → `/login` |
| `/design-system` | development | 404 em production |

## Rotas C1

| Path | Quem | Comportamento |
|------|------|----------------|
| `/clientes` | autenticado | lista + criação; filtros nome/responsável/status |
| `/clientes/:id` | autenticado | ficha, projetos do cliente, histórico |
| `/projetos` | autenticado | lista + criação; filtros responsável/status/cliente/prazo/prioridade |
| `/projetos/:id` | autenticado | cabeçalho operacional + overdue + **seção Etapas** + **seção Checklists** + histórico |

## Rotas C3

| Path | Quem | Comportamento |
|------|------|----------------|
| `/pipeline` | autenticado | board horizontal por etapa atual; filtros responsável/cliente/prioridade; card → `/projetos/:id` |

## Rotas C4

| Path | Quem | Comportamento |
|------|------|----------------|
| `/checklists` | autenticado | lista instâncias do workspace; visitante → `/login` |

Nav: Hoje / Pipeline / Clientes / Projetos / Checklists. `/hoje` continua empty state.

Primitivos: Button, Input, Card, StatusPill, Select, Textarea.

UI em **pt-BR**.
