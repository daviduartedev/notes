import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { CHECKLISTS_EMPTY, CHECKLISTS_LOAD_ERROR, checklistProjectHref } from "@/lib/checklist-copy";
import type { ProjectChecklistDto } from "@/lib/domain-types";
import { serverApi } from "@/lib/server-api";

export default async function ChecklistsPage() {
  const res = await serverApi<ProjectChecklistDto[]>("/api/checklists");
  const checklists = res.status === 200 && res.data ? res.data : [];
  const loadError = res.status !== 200;

  return (
    <AppShell title="Checklists" pathname="/checklists">
      {loadError ? (
        <p className="text-sm text-semantic-red">{CHECKLISTS_LOAD_ERROR}</p>
      ) : checklists.length === 0 ? (
        <p className="text-sm text-notes-muted">{CHECKLISTS_EMPTY}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {checklists.map((checklist) => {
            const done = checklist.items.filter((item) => item.completedAt).length;
            return (
              <Card key={checklist.id}>
                <a href={checklistProjectHref(checklist.projectId)} className="flex flex-col gap-1">
                  <h3 className="text-xl font-semibold">{checklist.name}</h3>
                  <p className="text-sm text-notes-muted">
                    {checklist.projectName} · {done}/{checklist.items.length} itens
                  </p>
                </a>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
