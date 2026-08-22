"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type { ClientDto, ClientStatus, MemberDto } from "@/lib/domain-types";
import { clientStatusLabel } from "@/lib/labels";

const statuses: ClientStatus[] = ["lead", "active", "inactive", "archived"];

function toDateInput(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

export function ClientEditForm({
  client,
  members,
}: {
  client: ClientDto;
  members: MemberDto[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await apiRequest<ClientDto>(`/api/clients/${client.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        company: String(form.get("company") ?? ""),
        whatsapp: String(form.get("whatsapp") ?? ""),
        email: String(form.get("email") ?? ""),
        ownerUserId: String(form.get("ownerUserId") ?? ""),
        notes: String(form.get("notes") ?? ""),
        status: String(form.get("status") ?? "") as ClientStatus,
        lastContactAt: String(form.get("lastContactAt") ?? "") || null,
        nextFollowUpAt: String(form.get("nextFollowUpAt") ?? "") || null,
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
        <Input name="name" defaultValue={client.name} required />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Empresa
        <Input name="company" defaultValue={client.company ?? ""} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        WhatsApp
        <Input name="whatsapp" defaultValue={client.whatsapp ?? ""} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        E-mail
        <Input name="email" type="email" defaultValue={client.email ?? ""} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Responsável interno
        <Select name="ownerUserId" defaultValue={client.ownerUserId}>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name ?? member.email}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Status
        <Select name="status" defaultValue={client.status}>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {clientStatusLabel[value]}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Último contato
        <Input name="lastContactAt" type="date" defaultValue={toDateInput(client.lastContactAt)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Próximo follow-up
        <Input name="nextFollowUpAt" type="date" defaultValue={toDateInput(client.nextFollowUpAt)} />
      </label>
      <label className="flex flex-col gap-1 text-sm md:col-span-2">
        Observações
        <Textarea name="notes" defaultValue={client.notes ?? ""} />
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
