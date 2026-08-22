import { AppShell } from "@/components/app-shell";
import { HojeBoard } from "@/components/hoje-board";
import type { HojeDashboardDto, WorkspaceDto } from "@/lib/domain-types";
import { DASHBOARD_TITLE, HOJE_LOAD_ERROR } from "@/lib/hoje-copy";
import { serverApi } from "@/lib/server-api";

const EMPTY_BOARD: HojeDashboardDto = {
  needs_attention: [],
  today: [],
  waiting_client: [],
  in_progress: [],
};

export default async function HojePage() {
  const [response, workspaceRes] = await Promise.all([
    serverApi<HojeDashboardDto>("/api/hoje"),
    serverApi<WorkspaceDto>("/api/workspace"),
  ]);
  const board = response.status === 200 && response.data ? response.data : EMPTY_BOARD;
  const workspace = workspaceRes.status === 200 ? workspaceRes.data : null;
  const loadError = response.status !== 200;

  return (
    <AppShell title={DASHBOARD_TITLE} pathname="/hoje">
      {loadError ? (
        <p className="px-8 text-sm text-semantic-red">{HOJE_LOAD_ERROR}</p>
      ) : (
        <HojeBoard board={board} workspace={workspace} />
      )}
    </AppShell>
  );
}
