"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { apiRequest } from "@/lib/api";
import type { ProjectDto, StageAction, StageDto, StagePhase } from "@/lib/domain-types";
import {
  stageActionLabel,
  stageKeyLabel,
  stagePhaseLabel,
  stageStatusLabel,
} from "@/lib/labels";
import { stageStatusTone } from "@/lib/status-tone";

const PHASES: StagePhase[] = ["commercial", "design", "development"];

function actionCaption(action: StageAction, toKey: string | null): string {
  if (action === "complete" && toKey) {
    return `Avançar para ${stageKeyLabel[toKey] ?? toKey}`;
  }
  if (action === "complete") {
    return "Concluir etapa";
  }
  return stageActionLabel[action];
}

export function StageBoard({ project }: { project: ProjectDto }) {
  const router = useRouter();
  const stages = project.stages ?? [];
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function runAction(stage: StageDto, action: StageAction, toKey: string | null) {
    setPendingId(`${stage.id}:${action}:${toKey ?? ""}`);
    setError(null);
    const response = await apiRequest<ProjectDto>(
      `/api/projects/${project.id}/stages/${stage.id}/transition`,
      {
        method: "POST",
        body: JSON.stringify({
          action,
          ...(toKey ? { to: toKey } : {}),
        }),
      },
    );
    setPendingId(null);
    if (response.status === 409) {
      const reason =
        response.data && typeof response.data === "object" && "reason" in response.data
          ? String((response.data as { reason?: string }).reason ?? "")
          : "";
      setError(reason || "Transição inválida");
      return;
    }
    if (response.status !== 200) {
      setError("Não foi possível transicionar a etapa");
      return;
    }
    router.refresh();
  }

  if (stages.length === 0) {
    return <p className="text-sm text-notes-muted">Nenhuma etapa neste projeto.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-semantic-red">{error}</p> : null}
      {PHASES.map((phase) => {
        const items = stages.filter((stage) => stage.phase === phase);
        if (items.length === 0) {
          return null;
        }
        return (
          <section key={phase} className="flex flex-col gap-3">
            <h4 className="text-lg text-notes-muted">{stagePhaseLabel[phase]}</h4>
            <ol className="flex flex-col gap-3">
              {items.map((stage) => (
                <li
                  key={stage.id}
                  className={`border p-3 ${
                    stage.isCurrent
                      ? "border-notes-ink bg-notes-raised"
                      : "border-notes-border bg-notes-panel"
                  }`}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="text-xl font-medium">{stage.label}</p>
                    <StatusPill tone={stageStatusTone[stage.status]}>
                      {stageStatusLabel[stage.status]}
                    </StatusPill>
                    {stage.isCurrent ? <StatusPill tone="blue">Atual</StatusPill> : null}
                    {project.visualState === "overdue" && stage.isCurrent ? (
                      <StatusPill tone="red">Atrasado</StatusPill>
                    ) : null}
                  </div>
                  <p className="text-xs text-notes-muted">{stage.exitCriteria}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(stage.isCurrent ? stage.actions : []).map((item) => {
                      const busy = pendingId === `${stage.id}:${item.action}:${item.toKey ?? ""}`;
                      return (
                        <Button
                          key={`${item.action}-${item.toKey ?? "none"}`}
                          variant={item.action === "complete" ? "primary" : "ghost"}
                          disabled={!item.enabled || Boolean(pendingId)}
                          pending={busy}
                          title={item.reason ?? undefined}
                          onClick={() => void runAction(stage, item.action, item.toKey)}
                        >
                          {actionCaption(item.action, item.toKey)}
                        </Button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
