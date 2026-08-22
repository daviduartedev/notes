import { AppShell } from "@/components/app-shell";
import { ReminderCreateForm } from "@/components/reminder-create-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterBar } from "@/components/ui/filter-bar";
import { Select } from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import type { ClientDto, ProjectDto, ReminderDto, ReminderStatus } from "@/lib/domain-types";
import { reminderStatusLabel } from "@/lib/labels";
import { REMINDER_CREATE_LABEL, REMINDERS_EMPTY, REMINDERS_LOAD_ERROR, reminderHref } from "@/lib/reminder-copy";
import { serverApi } from "@/lib/server-api";
import { reminderStatusTone } from "@/lib/status-tone";

const statuses: ReminderStatus[] = ["scheduled", "due", "done", "snoozed", "cancelled"];

function reminderTitle(reminder: ReminderDto): string {
  const firstLine = reminder.draftMessage.split("\n")[0]?.trim();
  return firstLine && firstLine.length > 0 ? firstLine : "Lembrete interno";
}

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
        <FilterBar method="get">
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
        </FilterBar>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold">{REMINDER_CREATE_LABEL}</h3>
        {clients.length === 0 || projects.length === 0 ? (
          <p className="mt-2 text-sm text-notes-muted">Crie um cliente e um projeto antes de cadastrar um lembrete.</p>
        ) : (
          <ReminderCreateForm clients={clients} projects={projects} />
        )}
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
                  <h3 className="text-xl font-semibold">{reminderTitle(reminder)}</h3>
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
