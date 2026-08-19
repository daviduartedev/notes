# language: pt
Funcionalidade: Validações (C5)
  Como operador da software house
  Quero solicitar e conduzir uma validação até um estado terminal
  Para verificar o trabalho sem confundir com aprovação formal

  Cenário: Ajustes solicitados geram activity e não criam Approval
    Dado uma validação em in_review no workspace A
    Quando transiciono para changes_requested
    Então o status passa a changes_requested
    E existe event validation.changes_requested no histórico do projeto
    E não existe event approval.*
    E o Stage.status da etapa atual permanece o mesmo

  Cenário: Transição ilegal é rejeitada
    Dado uma validação em draft
    Quando transiciono para approved
    Então a resposta é 409
    E o status permanece draft
    E nenhum event de validação é gravado

  Cenário: Prazo vencido não terminal mostra overdue
    Dado uma validação requested com dueDate no passado
    Quando peço GET da validação
    Então visualState é overdue

  Cenário: Status terminal não fica overdue
    Dado uma validação approved com dueDate no passado
    Quando peço GET da validação
    Então visualState é null

  Cenário: IDOR em validação de outro workspace
    Dado uma validação no workspace A
    Quando um membro do workspace B faz GET ou transition nesse id
    Então a resposta é 404 vazio

  Cenário: Collection isolada
    Dado uma validação no workspace A
    Quando um membro do workspace B pede GET /api/validations
    Então a lista vem vazia (não 404)

  Cenário: PATCH não muda status
    Dado uma validação em draft
    Quando faço PATCH com status approved
    Então o status permanece draft

  Cenário: Checklist opcional
    Dado uma instância de checklist no projeto
    Quando crio uma validação com checklistId
    Então a validação guarda checklistId
    E o checklist passa a ter validationId

  Cenário: Visitante não entra em /validacoes
    Dado que não há sessão
    Quando acesso /validacoes
    Então sou redirecionado para /login
