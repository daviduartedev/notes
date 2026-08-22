"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import { BLOCKER_CREATE_LABEL, BLOCKERS_EMPTY, WAITING_ON_CLIENT_COPY, blockerHref } from "@/lib/blocker-copy";
import type { BlockerAssigneeKind, BlockerDto, MemberDto, ProjectDto } from "@/lib/domain-types";
import { blockerAssigneeKindLabel, blockerStatusLabel } from "@/lib/labels";
import { blockerStatusTone } from "@/lib/status-tone";

export function ProjectBlockers({
  project,
  members,
  blockers,
}: {
  project: ProjectDto;
  members: MemberDto[];
  blockers: BlockerDto[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [assigneeKind, setAssigneeKind] = useState<BlockerAssigneeKind>("internal");
  const [assigneeUserId, setAssigneeUserId] = useState(members[0]?.id ?? "");
  const [blocksStageId, setBlocksStageId] = useState(project.currentStageId ?? "");
  const [blocksProject, setBlocksProject] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function createOpen() {
    setPending(true);
    setError(null);
    const response = await apiRequest<BlockerDto>("/api/blockers", {
      method: "POST",
      body: JSON.stringify({
        projectId: project.id,
        title: title.trim(),
        assigneeKind,
        assigneeUserId: assigneeKind === "internal" ? assigneeUserId : undefined,
        blocksStageId: blocksStageId || undefined,
        blocksProject,
        dueDate: dueDate || undefined,
        notes: notes.trim() || undefined,
      }),
    });
    setPending(false);
    if (response.status !== 201) {
      setError("Não foi possível abrir a pendência");
      return;
    }
    setTitle("");
    setNotes("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          placeholder="Título"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Select
          value={assigneeKind}
          onChange={(event) => setAssigneeKind(event.target.value as BlockerAssigneeKind)}
        >
          {(["internal", "client"] as const).map((value) => (
            <option key={value} value={value}>
              {blockerAssigneeKindLabel[value]}
            </option>
          ))}
        </Select>
        {assigneeKind === "internal" ? (
          <Select value={assigneeUserId} onChange={(event) => setAssigneeUserId(event.target.value)}>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name ?? member.email}
              </option>
            ))}
          </Select>
        ) : null}
        <Select value={blocksStageId} onChange={(event) => setBlocksStageId(event.target.value)}>
          <option value="">Não bloqueia etapa</option>
          {(project.stages ?? []).map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.label}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-2 text-sm text-notes-muted">
          <input
            type="checkbox"
            checked={blocksProject}
            onChange={(event) => setBlocksProject(event.target.checked)}
          />
          Bloqueia o projeto
        </label>
        <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        <Textarea
          className="md:col-span-2"
          placeholder="Observação"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <Button disabled={title.trim().length === 0} pending={pending} onClick={() => void createOpen()}>
          {BLOCKER_CREATE_LABEL}
        </Button>
      </div>
      {error ? <p className="text-sm text-semantic-red">{error}</p> : null}
      {blockers.length === 0 ? (
        <p className="text-sm text-notes-muted">{BLOCKERS_EMPTY}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {blockers.map((blocker) => (
            <li key={blocker.id}>
              <a href={blockerHref(blocker.id)} className="flex flex-wrap items-center gap-2">
                <StatusPill tone={blockerStatusTone[blocker.status]}>
                  {blockerStatusLabel[blocker.status]}
                </StatusPill>
                {blocker.waitingOnClient ? (
                  <StatusPill tone="yellow">{WAITING_ON_CLIENT_COPY}</StatusPill>
                ) : null}
                <span className="text-sm">{blocker.title}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
