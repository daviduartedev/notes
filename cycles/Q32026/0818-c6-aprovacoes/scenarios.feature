# language: pt
Funcionalidade: Aprovações (C6)
  Como operador da software house
  Quero registrar uma aprovação formal com snapshot
  Para autorizar avanço sem confundir com validação

  Cenário: Grant de staging grava approver, timestamp e snapshot
    Dado um projeto ativo no workspace A
    Quando crio Approval kind=staging e decido grant
    Então status é granted
    E approverId é o usuário da sessão
    E decidedAt está preenchido
    E projectSnapshot contém currentStageKey, projectStatus, projectId e clientId
    E Validation permanece entidade separada

  Cenário: approverId no body é ignorado
    Dado um Approval pending
    Quando decido grant com approverId forjado no body
    Então approverId gravado é o da sessão

  Cenário: Revoke não apaga o granted original
    Dado um Approval granted
    Quando decido revoke
    Então o mesmo id existe com status revoked
    E decidedAt e snapshot do grant permanecem
    E existe event approval.revoked

  Cenário: Decisão ilegal é rejeitada
    Dado um Approval pending
    Quando decido revoke
    Então a resposta é 409
    E o status permanece pending
    E nenhum event approval.* é gravado

  Cenário: Grant não avança etapa
    Dado um projeto com etapa briefing in_progress
    Quando concedo uma Approval
    Então Stage.status da etapa atual permanece in_progress

  Cenário: Validação aprovada não cria Approval
    Dado uma validação transicionada até approved
    Quando listo /api/approvals
    Então a lista não contém Approval gerada automaticamente
    E não existe event approval.*

  Cenário: IDOR em aprovação de outro workspace
    Dado uma Approval no workspace A
    Quando um membro do workspace B faz GET ou decide nesse id
    Então a resposta é 404 vazio

  Cenário: Collection isolada
    Dado uma Approval no workspace A
    Quando um membro do workspace B pede GET /api/approvals
    Então a lista vem vazia (não 404)

  Cenário: Visitante não entra em /aprovacoes
    Dado que não há sessão
    Quando acesso /aprovacoes
    Então sou redirecionado para /login
