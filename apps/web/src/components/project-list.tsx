import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import type { ProjectDto } from "@/lib/domain-types";
import { projectPriorityLabel, projectStatusLabel } from "@/lib/labels";
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
