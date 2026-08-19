"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import { apiRequest } from "@/lib/api";
import {
  CHECKLIST_APPLY_LABEL,
  CHECKLIST_MARK_LABEL,
  CHECKLISTS_EMPTY,
  formatChecklistCompletedAt,
} from "@/lib/checklist-copy";
import type {
  ChecklistTemplateDto,
  ProjectChecklistDto,
  ProjectDto,
} from "@/lib/domain-types";

export function ProjectChecklists({
  project,
  templates,
  checklists,
}: {
  project: ProjectDto;
  templates: ChecklistTemplateDto[];
  checklists: ProjectChecklistDto[];
}) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [stageId, setStageId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  async function applyTemplate() {
    if (!templateId) return;
    setPending(true);
    setError(null);
    const response = await apiRequest<ProjectChecklistDto>(
      `/api/projects/${project.id}/checklists/apply`,
      {
        method: "POST",
        body: JSON.stringify({
          templateId,
          ...(stageId ? { stageId } : {}),
        }),
      },
    );
    setPending(false);
    if (response.status !== 201) {
      setError("Não foi possível aplicar o template");
      return;
    }
    router.refresh();
  }

  async function toggleItem(itemId: string, completed: boolean) {
    setPendingItemId(itemId);
    setError(null);
    const response = await apiRequest(`/api/checklist-items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({
        completed,
        note: notes[itemId]?.trim() ? notes[itemId] : undefined,
      }),
    });
    setPendingItemId(null);
    if (response.status !== 200) {
      setError("Não foi possível atualizar o item");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-semantic-red">{error}</p> : null}
      <form
        className="grid gap-3 md:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          void applyTemplate();
        }}
      >
        <Select
          value={templateId}
          onChange={(event) => setTemplateId(event.target.value)}
          aria-label="Template"
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </Select>
        <Select
          value={stageId}
          onChange={(event) => setStageId(event.target.value)}
          aria-label="Etapa (opcional)"
        >
          <option value="">Sem etapa</option>
          {(project.stages ?? []).map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.label}
            </option>
          ))}
        </Select>
        <Button type="submit" disabled={pending || !templateId}>
          {CHECKLIST_APPLY_LABEL}
        </Button>
      </form>

      {checklists.length === 0 ? (
        <p className="text-sm text-notes-muted">{CHECKLISTS_EMPTY}</p>
      ) : (
        checklists.map((checklist) => (
          <section key={checklist.id} className="flex flex-col gap-3">
            <h4 className="font-display text-lg">{checklist.name}</h4>
            <ol className="flex flex-col gap-3">
              {checklist.items.map((item) => {
                const done = Boolean(item.completedAt);
                return (
                  <li
                    key={item.id}
                    className="flex flex-col gap-2 rounded-md border border-notes-border p-3 md:flex-row md:items-center"
                  >
                    <div className="flex-1">
                      <p className="text-sm">{item.title}</p>
                      <p className="text-xs text-notes-muted">
                        {done
                          ? `${item.completedByName ?? "Alguém"} · ${formatChecklistCompletedAt(item.completedAt)}`
                          : "Aberto"}
                        {item.note ? ` · ${item.note}` : ""}
                      </p>
                    </div>
                    <StatusPill tone={done ? "green" : "yellow"}>
                      {done ? "Concluído" : "Aberto"}
                    </StatusPill>
                    {!done ? (
                      <Input
                        placeholder="Observação (opcional)"
                        value={notes[item.id] ?? ""}
                        onChange={(event) =>
                          setNotes((current) => ({ ...current, [item.id]: event.target.value }))
                        }
                      />
                    ) : null}
                    <Button
                      variant="ghost"
                      disabled={pendingItemId === item.id}
                      onClick={() => void toggleItem(item.id, !done)}
                    >
                      {done ? "Reabrir" : CHECKLIST_MARK_LABEL}
                    </Button>
                  </li>
                );
              })}
            </ol>
          </section>
        ))
      )}
    </div>
  );
}
