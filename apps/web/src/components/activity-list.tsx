import type { ActivityDto } from "@/lib/domain-types";

const actionLabel: Record<ActivityDto["action"], string> = {
  "client.created": "Cliente criado",
  "client.updated": "Cliente atualizado",
  "project.created": "Projeto criado",
  "project.updated": "Projeto atualizado",
  "project.status_changed": "Status do projeto alterado",
  "stage.started": "Etapa iniciada",
  "stage.transitioned": "Etapa avançada",
  "stage.completed": "Etapa concluída",
  "checklist.applied": "Checklist aplicado",
  "checklist.item_completed": "Item de checklist concluído",
  "validation.requested": "Validação solicitada",
  "validation.in_review": "Validação em revisão",
  "validation.changes_requested": "Ajustes de validação solicitados",
  "validation.approved": "Validação aprovada",
  "validation.rejected": "Validação recusada",
  "approval.granted": "Aprovação concedida",
  "approval.rejected": "Aprovação recusada",
  "approval.revoked": "Aprovação revogada",
};

export function ActivityList({ events }: { events: ActivityDto[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-notes-muted">Nenhum evento ainda.</p>;
  }
  return (
    <ol className="flex flex-col gap-3">
      {events.map((event) => (
        <li key={event.id} className="rounded-md border border-notes-border bg-notes-raised p-3">
          <p className="text-sm font-medium">{actionLabel[event.action]}</p>
          <p className="text-xs text-notes-muted">
            {new Date(event.createdAt).toLocaleString("pt-BR")}
          </p>
          <pre className="mt-2 overflow-x-auto text-xs text-notes-muted">
            {JSON.stringify(event.payload, null, 2)}
          </pre>
        </li>
      ))}
    </ol>
  );
}
