# language: pt
Funcionalidade: Pipeline (C3)
  Como operador da software house
  Quero ver cada projeto na coluna da etapa atual
  Para acompanhar o quadro sem misturar tenants nem envelopes concluídos

  Cenário: Dois projetos em etapas diferentes
    Dado dois projetos do workspace A, um em "briefing" e outro em "ux"
    Quando peço GET /api/pipeline
    Então o de "briefing" aparece só na coluna briefing
    E o de "ux" aparece só na coluna ux
    E as dez colunas do template SaaS estão presentes

  Cenário: Isolamento entre workspaces
    Dado um projeto no workspace A
    Quando um membro do workspace B pede GET /api/pipeline
    Então a resposta não contém o projeto de A
    E as colunas vêm vazias (collection, sem 404)

  Cenário: Envelope concluído some do quadro
    Dado um projeto com status "completed" ou "cancelled"
    Quando peço GET /api/pipeline
    Então o projeto não aparece em nenhuma coluna

  Cenário: Projeto sem etapa atual
    Dado um projeto com currentStageId nulo
    Quando peço GET /api/pipeline
    Então o projeto não aparece no quadro

  Cenário: Filtro por responsável
    Dado dois projetos com responsáveis diferentes
    Quando filtro ownerUserId
    Então só o projeto daquele responsável aparece

  Cenário: Card leva à ficha
    Dado um card no quadro
    Então o destino do clique é /projetos/:id
    E não há drag-and-drop

  Cenário: Visitante não entra em /pipeline
    Dado que não há sessão
    Quando acesso /pipeline
    Então sou redirecionado para /login
