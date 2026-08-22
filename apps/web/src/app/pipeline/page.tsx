import { AppShell } from "@/components/app-shell";
import { PipelineBoard } from "@/components/pipeline-board";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterBar } from "@/components/ui/filter-bar";
import { Select } from "@/components/ui/select";
import type {
  ClientDto,
  MemberDto,
  PipelineBoardDto,
  ProjectPriority,
} from "@/lib/domain-types";
import { projectPriorityLabel } from "@/lib/labels";
import { PIPELINE_LOAD_ERROR } from "@/lib/pipeline-copy";
import { serverApi } from "@/lib/server-api";

const priorities: ProjectPriority[] = ["low", "medium", "high", "urgent"];

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{
    ownerUserId?: string;
    clientId?: string;
    priority?: string;
  }>;
}) {
  const filters = await searchParams;
  const params = new URLSearchParams();
  if (filters.ownerUserId) params.set("ownerUserId", filters.ownerUserId);
  if (filters.clientId) params.set("clientId", filters.clientId);
  if (filters.priority) params.set("priority", filters.priority);
  const query = params.toString();

  const [boardRes, membersRes, clientsRes] = await Promise.all([
    serverApi<PipelineBoardDto>(`/api/pipeline${query ? `?${query}` : ""}`),
    serverApi<MemberDto[]>("/api/workspace/members"),
    serverApi<ClientDto[]>("/api/clients"),
  ]);
  const board =
    boardRes.status === 200 && boardRes.data
      ? boardRes.data
      : { columns: [] };
  const members = membersRes.status === 200 && membersRes.data ? membersRes.data : [];
  const clients = clientsRes.status === 200 && clientsRes.data ? clientsRes.data : [];
  const loadError = boardRes.status !== 200;

  return (
    <AppShell title="Pipeline" pathname="/pipeline">
      <Card>
        <FilterBar method="get">
          <Select name="ownerUserId" defaultValue={filters.ownerUserId ?? ""}>
            <option value="">Todos os responsáveis</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name ?? member.email}
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
          <Select name="priority" defaultValue={filters.priority ?? ""}>
            <option value="">Todas as prioridades</option>
            {priorities.map((value) => (
              <option key={value} value={value}>
                {projectPriorityLabel[value]}
              </option>
            ))}
          </Select>
          <Button type="submit">Filtrar</Button>
        </FilterBar>
      </Card>

      {loadError ? (
        <p className="text-sm text-semantic-red">{PIPELINE_LOAD_ERROR}</p>
      ) : (
        <Card>
          <PipelineBoard board={board} />
        </Card>
      )}
    </AppShell>
  );
}
