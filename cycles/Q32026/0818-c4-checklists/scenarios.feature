# language: pt
Funcionalidade: Checklists (C4)
  Como operador da software house
  Quero aplicar um molde de checklist ao projeto e executar os itens
  Para registrar trabalho previsto sem corromper o histórico nem a etapa

  Cenário: Mesmo template em dois projetos
    Dado o template "Deploy Staging SaaS" no workspace A
    E dois projetos no workspace A
    Quando aplico o template em cada projeto
    Então cada projeto tem uma instância com os oito itens originais
    E as instâncias têm ids independentes

  Cenário: Mutar o template não altera instâncias
    Dado uma instância aplicada a partir do template
    Quando o owner altera o título de um item do molde
    Então a instância continua com o título original

  Cenário: Marcar item registra responsável e data
    Dado um item aberto numa instância
    Quando marco o item como concluído com observação
    Então completedByUserId é o usuário da sessão
    E completedAt é gravado
    E existe event checklist.item_completed no histórico do projeto

  Cenário: Completar item não muda Stage.status
    Dado um projeto com etapa atual in_progress
    Quando marco um item do checklist
    Então o status da etapa permanece in_progress

  Cenário: IDOR em item de outro workspace
    Dado um item no workspace A
    Quando um membro do workspace B faz PATCH nesse item
    Então a resposta é 404 vazio

  Cenário: Collection isolada
    Dado uma instância no workspace A
    Quando um membro do workspace B pede GET /api/checklists
    Então a lista vem vazia (não 404)

  Cenário: Member não edita template
    Dado um member do workspace A
    Quando ele tenta PATCH no template
    Então a resposta é 403

  Cenário: Apply gera event
    Dado um template e um projeto
    Quando aplico o template
    Então existe event checklist.applied no histórico do projeto

  Cenário: Visitante não entra em /checklists
    Dado que não há sessão
    Quando acesso /checklists
    Então sou redirecionado para /login
