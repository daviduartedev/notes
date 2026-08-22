# language: pt
Funcionalidade: Dashboard operacional, antecedência e lembrete manual
  Como membro do workspace
  Quero um quadro chamado Dashboard, atenção antecipada configurável e cadastro de lembretes
  Para não confundir com a coluna Hoje e agir antes dos compromissos

  Cenário: header e título dizem Dashboard
    Dado que estou autenticado
    Quando abro o quadro operacional
    Então o item de navegação e o título principal exibem "Dashboard"
    E a coluna do quadro continua chamada "Hoje"

  Cenário: antecedência joga compromisso em Precisa de atenção
    Dado que a antecedência do workspace é 3 dias
    E existe um lembrete ativo com vencimento em 3 dias UTC
    Quando consulto o quadro operacional
    Então o lembrete aparece em "Precisa de atenção"

  Cenário: antecedência zero não antecipa
    Dado que a antecedência do workspace é 0 dias
    E existe um lembrete ativo com vencimento em 3 dias UTC
    Quando consulto o quadro operacional
    Então o lembrete não aparece em "Precisa de atenção"

  Cenário: cadastrar lembrete manual
    Dado que existe um cliente e um projeto desse cliente
    Quando cadastro um lembrete com detalhes, data, cliente e projeto
    Então o lembrete aparece na lista de lembretes atrelado a esse cliente e projeto

  Cenário: recusar projeto de outro cliente
    Dado um projeto que não pertence ao cliente informado
    Quando tento cadastrar o lembrete
    Então a API recusa o pedido

  Cenário: isolamento de workspace
    Dado um lembrete no workspace A
    Quando um membro do workspace B lista lembretes
    Então a lista vem vazia
