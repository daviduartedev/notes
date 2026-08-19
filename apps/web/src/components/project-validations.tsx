"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type {
  MemberDto,
  ProjectChecklistDto,
  ProjectDto,
  ValidationDto,
  ValidationType,
} from "@/lib/domain-types";
import { validationStatusLabel, validationTypeLabel } from "@/lib/labels";
import { VALIDATION_CREATE_LABEL, VALIDATIONS_EMPTY, validationHref } from "@/lib/validation-copy";
import { validationStatusTone } from "@/lib/status-tone";

const types: ValidationType[] = ["prototype", "staging", "production", "feature", "delivery"];

export function ProjectValidations({
  project,
  members,
  checklists,
  validations,
}: {
  project: ProjectDto;
  members: MemberDto[];
  checklists: ProjectChecklistDto[];
  validations: ValidationDto[];
}) {
  const router = useRouter();
  const [type, setType] = useState<ValidationType>("staging");
  const [reviewerUserId, setReviewerUserId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [checklistId, setChecklistId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function createDraft() {
    setPending(true);
    setError(null);
    const response = await apiRequest<ValidationDto>(`/api/projects/${project.id}/validations`, {
      method: "POST",
      body: JSON.stringify({
        type,
        reviewerUserId: reviewerUserId || undefined,
        dueDate: dueDate || undefined,
        notes: notes.trim() || undefined,
        checklistId: checklistId || undefined,
      }),
    });
    setPending(false);
    if (response.status !== 201) {
      setError("Não foi possível criar a validação");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 md:grid-cols-2">
        <Select value={type} onChange={(event) => setType(event.target.value as ValidationType)}>
          {types.map((value) => (
            <option key={value} value={value}>
              {validationTypeLabel[value]}
            </option>
          ))}
        </Select>
        <Select value={reviewerUserId} onChange={(event) => setReviewerUserId(event.target.value)}>
          <option value="">Revisor (opcional)</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name ?? member.email}
            </option>
          ))}
        </Select>
        <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        <Select value={checklistId} onChange={(event) => setChecklistId(event.target.value)}>
          <option value="">Checklist (opcional)</option>
          {checklists.map((checklist) => (
            <option key={checklist.id} value={checklist.id}>
              {checklist.name}
            </option>
          ))}
        </Select>
        <Textarea
          className="md:col-span-2"
          placeholder="Observações"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <Button disabled={pending} onClick={() => void createDraft()}>
          {VALIDATION_CREATE_LABEL}
        </Button>
      </div>
      {error ? <p className="text-sm text-semantic-red">{error}</p> : null}
      {validations.length === 0 ? (
        <p className="text-sm text-notes-muted">{VALIDATIONS_EMPTY}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {validations.map((validation) => (
            <li key={validation.id}>
              <a href={validationHref(validation.id)} className="flex flex-wrap items-center gap-2">
                {validation.visualState === "overdue" ? (
                  <StatusPill tone="red">Atrasada</StatusPill>
                ) : null}
                <StatusPill tone={validationStatusTone[validation.status]}>
                  {validationStatusLabel[validation.status]}
                </StatusPill>
                <span className="text-sm">{validationTypeLabel[validation.type]}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
