import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import type { ProjectDto } from "@/lib/domain-types";
import { projectPriorityLabel, projectStatusLabel, stageKeyLabel } from "@/lib/labels";
import { projectStatusTone } from "@/lib/status-tone";

export function ProjectList({ projects }: { projects: ProjectDto[] }) {
  if (projects.length === 0) {
    return <p className="text-sm text-notes-muted">Nenhum projeto ainda.</p>;
  }
  return (
    <div className="grid gap-3">
      {projects.map((project) => (
        <a key={project.id} href={`/projetos/${project.id}`}>
          <Card className="flex flex-wrap items-center justify-between gap-3 hover:bg-notes-raised">
            <div>
              <p className="font-medium">{project.name}</p>
              <p className="text-sm text-notes-muted">{project.clientName}</p>
              {project.currentStageKey ? (
                <p className="mt-2 flex items-center gap-2 text-[12px] text-notes-muted">
                  <span className="size-2 shrink-0 bg-notes-ink" aria-hidden />
                  {stageKeyLabel[project.currentStageKey] ?? project.currentStageKey}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {project.visualState === "overdue" ? (
                <StatusPill tone="red">Atrasado</StatusPill>
              ) : null}
              <StatusPill tone={projectStatusTone[project.status]}>
                {projectStatusLabel[project.status]}
              </StatusPill>
              <StatusPill tone="purple">{projectPriorityLabel[project.priority]}</StatusPill>
            </div>
          </Card>
        </a>
      ))}
    </div>
  );
}
