"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type {
  ClientDto,
  MemberDto,
  ProjectDto,
  ProjectPriority,
  ProjectStatus,
} from "@/lib/domain-types";
import { projectPriorityLabel, projectStatusLabel } from "@/lib/labels";

const statuses: ProjectStatus[] = ["draft", "active", "on_hold", "completed", "cancelled"];
const priorities: ProjectPriority[] = ["low", "medium", "high", "urgent"];

function toDateInput(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

export function ProjectEditForm({
  project,
  members,
  clients,
}: {
  project: ProjectDto;
  members: MemberDto[];
  clients: ClientDto[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await apiRequest<ProjectDto>(`/api/projects/${project.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        description: String(form.get("description") ?? ""),
        clientId: String(form.get("clientId") ?? ""),
        ownerUserId: String(form.get("ownerUserId") ?? ""),
        status: String(form.get("status") ?? "") as ProjectStatus,
        startDate: String(form.get("startDate") ?? "") || null,
        dueDate: String(form.get("dueDate") ?? "") || null,
        priority: String(form.get("priority") ?? "medium"),
        progress: Number(String(form.get("progress") ?? "0")),
        notes: String(form.get("notes") ?? ""),
      }),
    });
    setPending(false);
    if (response.status === 409) {
      setError("Transição inválida");
      return;
    }
    if (response.status !== 200) {
      setError("Não foi possível salvar");
      return;
    }
    router.refresh();
  }

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void onSave(event)}>
      <label className="flex flex-col gap-1 text-sm">
        Nome
        <Input name="name" defaultValue={project.name} required />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Cliente
        <Select name="clientId" defaultValue={project.clientId}>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-sm md:col-span-2">
        Descrição
        <Textarea name="description" defaultValue={project.description ?? ""} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Responsável
        <Select name="ownerUserId" defaultValue={project.ownerUserId}>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name ?? member.email}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Status
        <Select name="status" defaultValue={project.status}>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {projectStatusLabel[value]}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Prioridade
        <Select name="priority" defaultValue={project.priority}>
          {priorities.map((value) => (
            <option key={value} value={value}>
              {projectPriorityLabel[value]}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Progresso (0–100)
        <Input name="progress" type="number" min={0} max={100} defaultValue={project.progress} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Início
        <Input name="startDate" type="date" defaultValue={toDateInput(project.startDate)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Prazo
        <Input name="dueDate" type="date" defaultValue={toDateInput(project.dueDate)} />
      </label>
      <label className="flex flex-col gap-1 text-sm md:col-span-2">
        Observações
        <Textarea name="notes" defaultValue={project.notes ?? ""} />
      </label>
      {error ? <p className="text-sm text-semantic-red md:col-span-2">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" pending={pending}>
          Salvar
        </Button>
      </div>
    </form>
  );
}
