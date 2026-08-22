export const DASHBOARD_TITLE = "Dashboard";
export const HOJE_LOAD_ERROR = "Não foi possível carregar o dashboard.";
export const ATTENTION_LEAD_LABEL = "Antecedência (dias)";
export const ATTENTION_LEAD_HINT = "Lembretes e reuniões entram em Precisa de atenção este número de dias antes.";

export const HOJE_SECTION_LABELS = {
  needs_attention: "Precisa de atenção",
  today: "Hoje",
  waiting_client: "Aguardando cliente",
  in_progress: "Projetos em andamento",
} as const;

export const HOJE_SECTION_EMPTY = {
  needs_attention: "Nada precisa de atenção agora.",
  today: "Nada para hoje.",
  waiting_client: "Nada aguardando o cliente.",
  in_progress: "Nenhum projeto em andamento.",
} as const;

export type HojeSectionKey = keyof typeof HOJE_SECTION_LABELS;

export const HOJE_SECTION_ORDER: HojeSectionKey[] = [
  "needs_attention",
  "today",
  "waiting_client",
  "in_progress",
];
