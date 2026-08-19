import { AppShell } from "@/components/app-shell";
import { HojeBoard } from "@/components/hoje-board";
import type { HojeDashboardDto } from "@/lib/domain-types";
import { HOJE_LOAD_ERROR } from "@/lib/hoje-copy";
import { serverApi } from "@/lib/server-api";

const EMPTY_BOARD: HojeDashboardDto = {
  needs_attention: [],
  today: [],
  waiting_client: [],
  in_progress: [],
};

export default async function HojePage() {
  const response = await serverApi<HojeDashboardDto>("/api/hoje");
  const board = response.status === 200 && response.data ? response.data : EMPTY_BOARD;
  const loadError = response.status !== 200;

  return (
    <AppShell title="Hoje" pathname="/hoje">
      {loadError ? <p className="text-sm text-semantic-red">{HOJE_LOAD_ERROR}</p> : <HojeBoard board={board} />}
    </AppShell>
  );
}
