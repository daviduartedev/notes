"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type { ClientDto, MemberDto, ProjectDto, ProjectPriority } from "@/lib/domain-types";
import { projectPriorityLabel } from "@/lib/labels";

const priorities: ProjectPriority[] = ["low", "medium", "high", "urgent"];

export function ProjectCreateForm({
  members,
  clients,
  defaultClientId,
}: {
  members: MemberDto[];
  clients: ClientDto[];
  defaultClientId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const progressRaw = String(data.get("progress") ?? "0");
    const response = await apiRequest<ProjectDto>("/api/projects", {
      method: "POST",
      body: JSON.stringify({
        name: String(data.get("name") ?? ""),
        description: String(data.get("description") ?? ""),
        clientId: String(data.get("clientId") ?? ""),
        ownerUserId: String(data.get("ownerUserId") ?? ""),
        startDate: String(data.get("startDate") ?? "") || null,
        dueDate: String(data.get("dueDate") ?? "") || null,
        priority: String(data.get("priority") ?? "medium"),
        progress: Number(progressRaw || 0),
        notes: String(data.get("notes") ?? ""),
      }),
    });
    setPending(false);
    if (response.status !== 201) {
      setError("Não foi possível criar o projeto");
      return;
    }
    form.reset();
    router.refresh();
  }

  if (clients.length === 0) {
    return <p className="mt-4 text-sm text-notes-muted">Crie um cliente antes de abrir um projeto.</p>;
  }

  return (
    <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={(event) => void onCreate(event)}>
      <label className="flex flex-col gap-1 text-sm">
        Nome
        <Input name="name" required />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Cliente
        <Select name="clientId" required defaultValue={defaultClientId ?? clients[0]?.id ?? ""}>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-sm md:col-span-2">
        Descrição
        <Textarea name="description" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Responsável
        <Select name="ownerUserId" required defaultValue={members[0]?.id ?? ""}>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name ?? member.email}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Prioridade
        <Select name="priority" defaultValue="medium">
          {priorities.map((value) => (
            <option key={value} value={value}>
              {projectPriorityLabel[value]}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Início
        <Input name="startDate" type="date" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Prazo
        <Input name="dueDate" type="date" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Progresso (0–100)
        <Input name="progress" type="number" min={0} max={100} defaultValue={0} />
      </label>
      <label className="flex flex-col gap-1 text-sm md:col-span-2">
        Observações
        <Textarea name="notes" />
      </label>
      {error ? <p className="text-sm text-semantic-red md:col-span-2">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Criando…" : "Criar projeto"}
        </Button>
      </div>
    </form>
  );
}
