import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import type { ClientDto, ProjectDto, ReminderDto, ReminderStatus } from "@/lib/domain-types";
import { reminderStatusLabel } from "@/lib/labels";
import { REMINDERS_EMPTY, REMINDERS_LOAD_ERROR, reminderHref } from "@/lib/reminder-copy";
import { serverApi } from "@/lib/server-api";
import { reminderStatusTone } from "@/lib/status-tone";

const statuses: ReminderStatus[] = ["scheduled", "due", "done", "snoozed", "cancelled"];

export default async function LembretesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    projectId?: string;
    clientId?: string;
  }>;
}) {
  const filters = await searchParams;
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.projectId) params.set("projectId", filters.projectId);
  if (filters.clientId) params.set("clientId", filters.clientId);
  const query = params.toString();

  const [remindersRes, clientsRes, projectsRes] = await Promise.all([
    serverApi<ReminderDto[]>(`/api/reminders${query ? `?${query}` : ""}`),
    serverApi<ClientDto[]>("/api/clients"),
    serverApi<ProjectDto[]>("/api/projects"),
  ]);
  const reminders = remindersRes.status === 200 && remindersRes.data ? remindersRes.data : [];
  const clients = clientsRes.status === 200 && clientsRes.data ? clientsRes.data : [];
  const projects = projectsRes.status === 200 && projectsRes.data ? projectsRes.data : [];
  const loadError = remindersRes.status !== 200;

  return (
    <AppShell title="Lembretes" pathname="/lembretes">
      <Card>
        <form className="grid gap-3 md:grid-cols-4" method="get">
          <Select name="status" defaultValue={filters.status ?? ""}>
            <option value="">Todos os status</option>
            {statuses.map((value) => (
              <option key={value} value={value}>
                {reminderStatusLabel[value]}
              </option>
            ))}
          </Select>
          <Select name="projectId" defaultValue={filters.projectId ?? ""}>
            <option value="">Todos os projetos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
          <Select name="clientId" defaultValue={filters.clientId ?? ""}>
            <option value="">Todos os clientes</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
          <Button type="submit">Filtrar</Button>
        </form>
      </Card>

      {loadError ? (
        <p className="text-sm text-semantic-red">{REMINDERS_LOAD_ERROR}</p>
      ) : reminders.length === 0 ? (
        <p className="text-sm text-notes-muted">{REMINDERS_EMPTY}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reminders.map((reminder) => (
            <Card key={reminder.id}>
              <a href={reminderHref(reminder.id)} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone={reminderStatusTone[reminder.status]}>
                    {reminderStatusLabel[reminder.status]}
                  </StatusPill>
                  {reminder.visualState === "overdue" ? (
                    <StatusPill tone="red">Atrasado</StatusPill>
                  ) : null}
                  <h3 className="font-display text-xl">Follow-up interno</h3>
                </div>
                <p className="text-sm text-notes-muted">
                  {reminder.projectName ?? "Projeto"} · {reminder.clientName}
                </p>
              </a>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
