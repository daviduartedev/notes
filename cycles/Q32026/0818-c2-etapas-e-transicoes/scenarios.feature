# language: pt
Funcionalidade: Etapas e transições (C2)
  Como operador da software house
  Quero que cada projeto nasça com etapas copiadas do template SaaS
  Para avançar só por transição válida, com histórico de/para

  Cenário: Projeto novo copia as 10 etapas do template SaaS
    Dado que estou autenticado no workspace A
    Quando crio um projeto
    Então o projeto possui as 10 etapas do template SaaS delivery
    E a primeira etapa está em andamento e é a etapa atual
    E as demais estão pendentes

  Cenário: Avançar etapa válida
    Dado um projeto na etapa "ux" em andamento
    Quando completo a etapa atual rumo a "prototype"
    Então a etapa atual passa a ser "prototype"
    E o histórico registra transição de "ux" para "prototype"

  Cenário: Pulo ilegal de etapa
    Dado um projeto na etapa "briefing"
    Quando tento transicionar para "kickoff"
    Então a API rejeita com 409
    E nenhum event de transição é gravado

  Cenário: Etapa bloqueada não completa
    Dado que a etapa atual está "blocked"
    Quando tento completá-la
    Então a API rejeita a transição

  Cenário: Etapa concluída é terminal
    Dado que a etapa "production" está concluída
    Quando tento reabri-la ou avançá-la
    Então a API rejeita a transição

  Cenário: Isolamento entre workspaces
    Dado que estou autenticado no workspace A
    Quando peço transição numa etapa do workspace B
    Então a API responde 404 sem payload

  Cenário: Template editado não reescreve instâncias
    Dado um projeto com etapas já copiadas
    Quando altero o template seed do workspace
    Então as etapas daquele projeto permanecem iguais à cópia original

  Cenário: Uma etapa atual por projeto
    Dado um projeto com o pipeline SaaS
    Então exatamente uma etapa está marcada como atual
