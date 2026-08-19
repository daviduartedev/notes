# language: pt
Funcionalidade: Pendências / blockers (C7)
  Como operador da software house
  Quero abrir e resolver pendências circunstanciais
  Para impedir completar etapa enquanto houver blocker open, sem confundir com checklist

  Cenário: Blocker open na etapa atual impede complete
    Dado um projeto com etapa briefing in_progress
    Quando crio um Blocker que bloqueia essa etapa
    Então Stage.status da etapa atual é blocked
    E POST transition complete devolve 409
    E o motivo menciona pendência em aberto

  Cenário: Resolver desbloqueia sem avançar etapa
    Dado um Blocker open bloqueando a etapa atual
    Quando decido resolve
    Então status do Blocker é resolved
    E Stage.status volta a in_progress
    E currentStageKey permanece o mesmo
    E complete deixa de ser rejeitado por esse motivo

  Cenário: assigneeKind client grava userId nulo
    Dado um projeto no workspace A
    Quando crio Blocker assigneeKind=client com assigneeUserId forjado
    Então assigneeUserId gravado é null
    E a UI usa o copy Aguardando cliente

  Cenário: Blocker não é item de checklist
    Dado um projeto com checklist aplicado
    Quando crio um Blocker
    Então o Blocker não aparece como ChecklistItem
    E o checklist permanece entidade separada

  Cenário: Decisão ilegal é rejeitada
    Dado um Blocker resolved
    Quando decido resolve de novo
    Então a resposta é 409
    E nenhum event blocker.* extra é gravado

  Cenário: IDOR em pendência de outro workspace
    Dado um Blocker no workspace A
    Quando um membro do workspace B faz GET ou decide nesse id
    Então a resposta é 404 vazio

  Cenário: Collection isolada
    Dado um Blocker no workspace A
    Quando um membro do workspace B pede GET /api/blockers
    Então a lista vem vazia (não 404)

  Cenário: Visitante não entra em /pendencias
    Dado que não há sessão
    Quando acesso /pendencias
    Então sou redirecionado para /login
