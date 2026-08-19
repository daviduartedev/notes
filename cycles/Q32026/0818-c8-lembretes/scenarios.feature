# language: pt
Funcionalidade: Lembretes e follow-ups (C8)
  Como operador da software house
  Quero ver lembretes internos quando a proposta espera o cliente
  Para copiar a mensagem, marcar enviado ou adiar, sem enviar nada para fora

  Cenário: Política dos 3 dias cria reminder
    Dado um projeto na etapa waiting_client
    E lastInteractionAt há mais de 3 dias (relógio fake)
    Quando peço GET /api/reminders
    Então um Reminder due da política proposalWaitingClientFollowUp é criado
    E o canal é internal

  Cenário: Política não dispara cedo nem duplica
    Dado um projeto waiting_client com interação recente
    Quando peço GET /api/reminders
    Então a lista não ganha reminder da política
    E um segundo GET após o gatilho não duplica scheduled/due

  Cenário: Marcar enviado e adiar
    Dado um Reminder due
    Quando decido complete
    Então o status é done
    E quando decido snooze em outro due
    Então o status volta a scheduled com dueAt daqui a 7 dias

  Cenário: Draft não vai para o log
    Dado um Reminder criado pela política
    Quando consulto o activity do projeto
    Então o payload não contém o texto completo do draft

  Cenário: Nada é enviado para fora
    Dado qualquer Reminder
    Então channel permanece internal
    E não há integração WhatsApp nem e-mail

  Cenário: Decisão ilegal é rejeitada
    Dado um Reminder done
    Quando decido complete de novo
    Então a resposta é 409
    E nenhum event reminder.* extra é gravado

  Cenário: IDOR em lembrete de outro workspace
    Dado um Reminder no workspace A
    Quando um membro do workspace B faz GET ou decide nesse id
    Então a resposta é 404 vazio

  Cenário: Collection isolada
    Dado um Reminder no workspace A
    Quando um membro do workspace B pede GET /api/reminders
    Então a lista vem vazia (não 404)

  Cenário: Visitante não entra em /lembretes
    Dado que não há sessão
    Quando acesso /lembretes
    Então sou redirecionado para /login
