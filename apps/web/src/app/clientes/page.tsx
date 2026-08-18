import { AppShell } from "@/components/app-shell";
import { ClientCreateForm } from "@/components/client-create-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import type { ClientDto, ClientStatus, MemberDto } from "@/lib/domain-types";
import { clientStatusLabel } from "@/lib/labels";
import { serverApi } from "@/lib/server-api";
import { clientStatusTone } from "@/lib/status-tone";

const statuses: ClientStatus[] = ["lead", "active", "inactive", "archived"];

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; ownerUserId?: string; status?: string }>;
}) {
  const filters = await searchParams;
  const params = new URLSearchParams();
  if (filters.name?.trim()) params.set("name", filters.name.trim());
  if (filters.ownerUserId) params.set("ownerUserId", filters.ownerUserId);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();

  const [list, memberList] = await Promise.all([
    serverApi<ClientDto[]>(`/api/clients${query ? `?${query}` : ""}`),
    serverApi<MemberDto[]>("/api/workspace/members"),
  ]);
  const clients = list.status === 200 && list.data ? list.data : [];
  const members = memberList.status === 200 && memberList.data ? memberList.data : [];

  return (
    <AppShell title="Clientes" pathname="/clientes">
      <Card>
        <form className="grid gap-3 md:grid-cols-4" method="get">
          <Input name="name" placeholder="Filtrar por nome" defaultValue={filters.name ?? ""} />
          <Select name="ownerUserId" defaultValue={filters.ownerUserId ?? ""}>
            <option value="">Todos os responsáveis</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name ?? member.email}
              </option>
            ))}
          </Select>
          <Select name="status" defaultValue={filters.status ?? ""}>
            <option value="">Todos os status</option>
            {statuses.map((value) => (
              <option key={value} value={value}>
                {clientStatusLabel[value]}
              </option>
            ))}
          </Select>
          <Button type="submit">Filtrar</Button>
        </form>
      </Card>

      <Card>
        <h3 className="font-display text-xl">Novo cliente</h3>
        <ClientCreateForm members={members} />
      </Card>

      <div className="grid gap-3">
        {clients.length === 0 ? (
          <p className="text-sm text-notes-muted">Nenhum cliente ainda.</p>
        ) : (
          clients.map((client) => (
            <a key={client.id} href={`/clientes/${client.id}`}>
              <Card className="flex items-center justify-between hover:bg-notes-raised">
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-notes-muted">{client.company ?? "Sem empresa"}</p>
                </div>
                <StatusPill tone={clientStatusTone[client.status]}>
                  {clientStatusLabel[client.status]}
                </StatusPill>
              </Card>
            </a>
          ))
        )}
      </div>
    </AppShell>
  );
}
