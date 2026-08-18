# request.md — Hoje / dashboard operacional (C10)

> **Ciclo:** `0818-c10-hoje-dashboard-operacional`  
> **Tipo:** Medium (reclassificar Large no refine se o aggregator explodir)  
> **Criado em:** 18/08/2026  
> **Path:** `cycles/Q32026/0818-c10-hoje-dashboard-operacional/`  
> **Depende de:** C3–C9 (MVP)  
> **Fecha o MVP**

---

## Contexto

`/hoje` é o quadro da empresa. Prioriza **ações**, não gráficos administrativos.

Deve responder:

1. projetos em andamento  
2. etapa atual  
3. o que fazer agora  
4. aguardando cliente  
5. bloqueado  
6. validações  
7. aprovações pendentes  
8. prazos próximos/atrasados  
9. follow-up  
10. (histórico continua na ficha; o board linka)

---

## Objetivo

Quatro seções acionáveis, isoladas por workspace, com próxima ação e link.

---

## Escopo

- Seções: Precisa de atenção; Hoje; Aguardando cliente; Projetos em andamento
- Card: cliente, projeto, motivo, desde quando, próxima ação, deep-link
- `GET /api/hoje` — queries por seção (evitar N+1); índices se necessário
- “Aguardando cliente” = união explícita: etapa waiting + owner cliente, validação requested, blocker responsável cliente, lembrete de proposta
- Linguagem visual do quadro (post-its, colunas, setas leves) — sem copiar Excalidraw
- Sem tabela nova de dashboard (read model)

---

## Fora de escopo

- BI, financeiro, widgets customizáveis, IA
- WhatsApp

---

## Critérios de aceite

- [ ] Fixture com atraso + validação pending + blocker do cliente + follow-up due → cada um na seção correta
- [ ] Workspace B não vê nenhum card do A
- [ ] Empty por seção com copy clara, não mock de métricas

---

## Pontos que o refinamento deve esclarecer

- Limite de cards por seção
- Se C9 não fechou: omitir reuniões da seção Hoje e documentar no plan

## Segurança

Maior risco de vazamento agregado. Teste cruzado de tenant obrigatório.

## Referências

- C3–C9
