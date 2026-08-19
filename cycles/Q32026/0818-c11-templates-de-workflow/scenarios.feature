# language: pt
Funcionalidade: Templates de workflow (C11)
  Como owner da software house
  Quero escolher e editar modelos de entrega por tipo de projeto
  Para gerar etapas distintas na criação sem canvas BPM

  Cenário: Landing e SaaS geram etapas diferentes
    Dado templates seedados no workspace
    Quando crio um projeto com o template landing e outro com saas_delivery
    Então as keys das etapas do Landing não são iguais às do SaaS
    E o Landing começa em Briefing com 4 etapas

  Cenário: Editar o molde não altera instâncias
    Dado um projeto criado a partir do template landing
    Quando o owner altera allowedNextKeys da primeira etapa do molde
    Então o GET da ficha do projeto mantém as arestas copiadas na criação

  Cenário: Create exige template do workspace
    Dado um membro autenticado
    Quando peço POST /api/projects sem workflowTemplateId
    Então recebo 400
    E um id de template de outro workspace devolve 404 vazio

  Cenário: Owner edita e member só escolhe
    Dado um member do mesmo workspace
    Quando ele pede GET /api/workflow-templates
    Então vê a lista para escolher no create
    E POST/PATCH/DELETE devolvem 403

  Cenário: Workspace B não vê templates do A
    Dado templates no workspace A
    Quando um owner do workspace B lista /api/workflow-templates
    Então não aparece id do A
    E GET por id do A devolve 404 vazio

  Cenário: Sem canvas de fluxo
    Dado a UI de /workflows
    Então o owner edita etapas em formulário
    E não há editor BPM nem canvas drag-and-drop

  Cenário: Visitante não entra em /workflows
    Dado que não há sessão
    Quando acesso /workflows
    Então sou redirecionado para /login
