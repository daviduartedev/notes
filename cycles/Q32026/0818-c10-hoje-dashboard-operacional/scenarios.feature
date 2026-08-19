# language: pt
Funcionalidade: Quadro operacional de Hoje (C10)
  Como operador da software house
  Quero ver o que precisa de atenção, o que é hoje, o que espera o cliente e o que está em andamento
  Para agir a partir de /hoje sem gráficos administrativos

  Cenário: Fixture cai na seção correta
    Dado um workspace com projeto atrasado, validação solicitada, pendência do cliente e follow-up due
    Quando peço GET /api/hoje
    Então o projeto atrasado está em needs_attention
    E a validação solicitada está em waiting_client
    E a pendência do cliente está em waiting_client
    E o follow-up due está em today
    E cada card tem clientName, projectName, reason, since, nextAction e href

  Cenário: Workspace B não vê cards do A
    Dado cards operacionais no workspace A
    Quando um membro do workspace B pede GET /api/hoje
    Então as quatro seções vêm vazias
    E nenhum id do A aparece

  Cenário: Empty por seção
    Dado um workspace sem operação
    Quando peço GET /api/hoje
    Então as quatro seções vêm como listas vazias
    E a UI de /hoje mostra copy clara em cada coluna, sem mock de métricas

  Cenário: Visitante não entra em /hoje
    Dado que não há sessão
    Quando acesso /hoje
    Então sou redirecionado para /login
