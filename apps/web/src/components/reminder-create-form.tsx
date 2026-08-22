"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type { ClientDto, ProjectDto, ReminderDto } from "@/lib/domain-types";
import { REMINDER_CREATE_ERROR, REMINDER_CREATE_LABEL } from "@/lib/reminder-copy";

export function ReminderCreateForm({
  clients,
  projects,
  lockedClientId,
  lockedProjectId,
}: {
  clients: ClientDto[];
  projects: ProjectDto[];
  lockedClientId?: string;
  lockedProjectId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [clientId, setClientId] = useState(lockedClientId ?? clients[0]?.id ?? "");

  const visibleProjects = useMemo(
    () => (clientId ? projects.filter((project) => project.clientId === clientId) : projects),
    [clientId, projects],
  );

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const dueDate = String(data.get("dueAt") ?? "");
    const dueAt = dueDate ? new Date(`${dueDate}T12:00:00.000Z`).toISOString() : "";
    const response = await apiRequest<ReminderDto>("/api/reminders", {
      method: "POST",
      body: JSON.stringify({
        draftMessage: String(data.get("draftMessage") ?? ""),
        dueAt,
        clientId: String(data.get("clientId") ?? ""),
        projectId: String(data.get("projectId") ?? ""),
      }),
    });
    setPending(false);
    if (response.status !== 201) {
      setError(REMINDER_CREATE_ERROR);
      return;
    }
    form.reset();
    router.refresh();
  }

  return (
    <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={(event) => void onCreate(event)}>
      <label className="flex flex-col gap-1 text-sm md:col-span-2">
        Detalhes
        <Textarea name="draftMessage" required placeholder="O que precisa ser lembrado?" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Data
        <Input name="dueAt" type="date" required />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Cliente
        <Select
          name="clientId"
          required
          disabled={Boolean(lockedClientId)}
          value={lockedClientId ?? clientId}
          onChange={(event) => setClientId(event.target.value)}
        >
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-sm md:col-span-2">
        Projeto
        <Select
          key={clientId}
          name="projectId"
          required
          disabled={Boolean(lockedProjectId)}
          defaultValue={lockedProjectId ?? visibleProjects[0]?.id ?? ""}
        >
          {visibleProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
      </label>
      {error ? <p className="text-sm text-semantic-red md:col-span-2">{error}</p> : null}
      <Button type="submit" pending={pending || visibleProjects.length === 0}>
        {REMINDER_CREATE_LABEL}
      </Button>
    </form>
  );
}
