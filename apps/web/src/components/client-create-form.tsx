"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type { ClientDto, MemberDto } from "@/lib/domain-types";

export function ClientCreateForm({ members }: { members: MemberDto[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await apiRequest<ClientDto>("/api/clients", {
      method: "POST",
      body: JSON.stringify({
        name: String(data.get("name") ?? ""),
        company: String(data.get("company") ?? ""),
        whatsapp: String(data.get("whatsapp") ?? ""),
        email: String(data.get("email") ?? ""),
        ownerUserId: String(data.get("ownerUserId") ?? ""),
        notes: String(data.get("notes") ?? ""),
        lastContactAt: String(data.get("lastContactAt") ?? "") || null,
        nextFollowUpAt: String(data.get("nextFollowUpAt") ?? "") || null,
      }),
    });
    setPending(false);
    if (response.status !== 201) {
      setError("Não foi possível criar o cliente");
      return;
    }
    form.reset();
    router.refresh();
  }

  return (
    <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={(event) => void onCreate(event)}>
      <label className="flex flex-col gap-1 text-sm">
        Nome
        <Input name="name" required />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Empresa
        <Input name="company" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        WhatsApp
        <Input name="whatsapp" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        E-mail
        <Input name="email" type="email" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Responsável interno
        <Select name="ownerUserId" required defaultValue={members[0]?.id ?? ""}>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name ?? member.email}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Último contato
        <Input name="lastContactAt" type="date" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Próximo follow-up
        <Input name="nextFollowUpAt" type="date" />
      </label>
      <label className="flex flex-col gap-1 text-sm md:col-span-2">
        Observações
        <Textarea name="notes" />
      </label>
      {error ? <p className="text-sm text-semantic-red md:col-span-2">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Criando…" : "Criar cliente"}
        </Button>
      </div>
    </form>
  );
}
