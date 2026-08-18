# language: pt
Funcionalidade: Clientes e projetos (C1)
  Como operador da software house
  Quero cadastrar clientes e vários projetos no mesmo cliente
  Para operar o quadro isolado por workspace, com histórico consultável

  Cenário: Criar cliente no workspace da sessão
    Dado que estou autenticado no workspace A
    Quando crio um cliente com nome, responsável interno e dados de contato
    Então o cliente fica disponível em "/clientes"
    E o workspaceId usado é o da sessão

  Cenário: Filtrar clientes
    Dado que existem clientes no meu workspace
    Quando filtro por nome, responsável ou status
    Então vejo só os clientes que correspondem

  Cenário: Transição inválida de status do cliente
    Dado um cliente com status "archived"
    Quando tento mudar o status para "active"
    Então a API rejeita a transição

  Cenário: Dois projetos no mesmo cliente
    Dado um cliente no meu workspace
    Quando crio dois projetos para esse cliente
    Então os dois aparecem na ficha do cliente e em "/projetos"

  Cenário: Histórico registra criação dos projetos
    Dado que criei dois projetos no mesmo cliente
    Quando consulto o histórico do cliente ou dos projetos
    Então vejo "project.created" duas vezes com payload consultável
    E o payload não contém telefone nem e-mail

  Cenário: Isolamento entre workspaces
    Dado que estou autenticado no workspace A
    Quando peço um cliente ou projeto do workspace B
    Então a API responde 404 sem payload

  Cenário: Transição inválida de status do projeto
    Dado um projeto "draft"
    Quando tento mudar o status para "completed"
    Então a API rejeita a transição

  Cenário: Prazo vencido em projeto ativo
    Dado um projeto "active" com prazo no passado
    Quando abro a ficha ou a listagem
    Então o projeto tem estado visual "overdue"

  Cenário: Mass assignment bloqueado
    Dado que estou autenticado
    Quando envio workspaceId ou createdAt no body de cliente ou projeto
    Então esses campos são ignorados
    E o registro fica no workspace da sessão
