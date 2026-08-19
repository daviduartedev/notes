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
| `/hoje` | autenticado | quadro operacional de 4 seções; empty copy por coluna; visitante ou JWT inválido → `/login` |
| `/design-system` | development | 404 em production |

## Rotas C1

| Path | Quem | Comportamento |
|------|------|----------------|
| `/clientes` | autenticado | lista + criação; filtros nome/responsável/status |
| `/clientes/:id` | autenticado | ficha, projetos do cliente, histórico |
| `/projetos` | autenticado | lista + criação; filtros responsável/status/cliente/prazo/prioridade |
| `/projetos/:id` | autenticado | cabeçalho operacional + overdue + **seção Etapas** + **seção Checklists** + **seção Validações** + **seção Aprovações** + **seção Pendências** + **seção Lembretes** + **seção Reuniões** + histórico |

## Rotas C3

| Path | Quem | Comportamento |
|------|------|----------------|
| `/pipeline` | autenticado | board horizontal por etapa atual; filtros responsável/cliente/prioridade; card → `/projetos/:id` |

## Rotas C4

| Path | Quem | Comportamento |
|------|------|----------------|
| `/checklists` | autenticado | lista instâncias do workspace; visitante → `/login` |

## Rotas C5

| Path | Quem | Comportamento |
|------|------|----------------|
| `/validacoes` | autenticado | lista + filtros status/projeto/cliente/responsável/prazo; visitante → `/login` |
| `/validacoes/:id` | autenticado | ficha + transições; StatusPill roxo; overdue vermelho |

## Rotas C6

| Path | Quem | Comportamento |
|------|------|----------------|
| `/aprovacoes` | autenticado | lista + filtros status/kind/projeto/cliente; visitante → `/login` |
| `/aprovacoes/:id` | autenticado | ficha + decidir; snapshot; StatusPill por status |

## Rotas C7

| Path | Quem | Comportamento |
|------|------|----------------|
| `/pendencias` | autenticado | lista + filtros status/responsável/projeto/cliente/bloqueando/atrasadas; visitante → `/login` |
| `/pendencias/:id` | autenticado | ficha + decidir; copy Aguardando cliente |

## Rotas C8

| Path | Quem | Comportamento |
|------|------|----------------|
| `/lembretes` | autenticado | lista + filtros status/projeto/cliente; visitante → `/login` |
| `/lembretes/:id` | autenticado | ficha; copiar draft, marcar enviado, adiar |

## Rotas C9

| Path | Quem | Comportamento |
|------|------|----------------|
| `/reunioes` | autenticado | lista + filtros tipo/projeto/cliente; visitante → `/login` |
| `/reunioes/:id` | autenticado | ficha com notas, decisões e próximos passos |

## Rotas C10

| Path | Quem | Comportamento |
|------|------|----------------|
| `/hoje` | autenticado | quatro colunas (Precisa de atenção / Hoje / Aguardando cliente / Projetos em andamento); post-its e setas leves; empty por seção |

Nav: Hoje / Pipeline / Clientes / Projetos / Checklists / Validações / Aprovações / Pendências / Lembretes / Reuniões. Pipeline cards com pills Pendência / Aguardando cliente.

Primitivos: Button, Input, Card, StatusPill, Select, Textarea.

UI em **pt-BR**.
