# language: pt
Funcionalidade: Fundação do Notes (C0)
  Como operador da software house
  Quero um repositório autenticado com um workspace seed
  Para começar o quadro operacional sem clientes nem projetos ainda

  Cenário: Visitante não acessa o quadro
    Dado que não estou autenticado
    Quando tento abrir "/hoje"
    Então sou redirecionado para "/login"

  Cenário: Login com o owner seed
    Dado que existe um workspace seed com um owner
    Quando faço login com o e-mail e a senha seed
    Então acesso o shell autenticado
    E vejo "/hoje" com o empty state "quadro ainda sem operação"

  Cenário: Logout encerra a sessão
    Dado que estou autenticado
    Quando faço logout
    Então deixo de acessar rotas autenticadas

  Cenário: Membro sem membership recebe 403
    Dado que estou autenticado sem membership válida no workspace da sessão
    Quando peço "/api/me" ou "/api/workspace"
    Então a API responde 403

  Cenário: Isolamento de workspace
    Dado que estou autenticado num workspace
    Quando uma query operacional é executada
    Então o workspaceId usado é o da sessão
    E um workspaceId enviado no body é ignorado

  Cenário: Recurso de outro tenant não vaza existência
    Dado que estou autenticado no workspace A
    Quando peço um recurso que pertence ao workspace B
    Então a API responde 404 sem payload

  Cenário: Health da API
    Quando peço GET "/health" na porta 3014
    Então a API responde sucesso

  Cenário: Design system só em desenvolvimento
    Dado que o ambiente é production
    Quando abro "/design-system"
    Então recebo 404

  Cenário: Harness reconhecível
    Então existe "spec/harness.md"
    E os gates lint, typecheck, test e build passam
