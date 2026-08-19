# language: pt
Funcionalidade: Reuniões (C9)
  Como operador da software house
  Quero registrar reuniões com notas e decisões na ficha
  Para o histórico do projeto/cliente mostrar o que foi combinado, sem avançar etapa sozinho

  Cenário: Reunião de validação staging aparece na ficha e no histórico
    Dado um projeto com uma validação de staging
    Quando crio uma reunião tipo staging_validation com uma decisão
    Então a reunião aparece em GET do projeto
    E o histórico do projeto contém meeting.created
    E o payload não contém o texto das notas nem das decisões

  Cenário: Participantes de fora do workspace são rejeitados
    Dado um projeto no workspace A
    Quando crio uma reunião com um userId que não é membro
    Então a resposta é 400
    E o motivo é Participante fora do workspace
    E nenhuma reunião é gravada

  Cenário: Reunião não altera etapa nem abre pendência
    Dado um projeto na etapa briefing em andamento
    Quando crio uma reunião kickoff
    Então a etapa atual continua briefing in_progress
    E a lista de blockers do projeto permanece vazia

  Cenário: IDOR em reunião de outro workspace
    Dado uma reunião no workspace A
    Quando um membro do workspace B faz GET ou PATCH nesse id
    Então a resposta é 404 vazio

  Cenário: Collection isolada
    Dado uma reunião no workspace A
    Quando um membro do workspace B pede GET /api/meetings
    Então a lista vem vazia (não 404)

  Cenário: Visitante não entra em /reunioes
    Dado que não há sessão
    Quando acesso /reunioes
    Então sou redirecionado para /login
