"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import { APPROVAL_CREATE_LABEL, APPROVALS_EMPTY, approvalHref } from "@/lib/approval-copy";
import type { ApprovalDto, ApprovalKind, ProjectDto } from "@/lib/domain-types";
import { approvalKindLabel, approvalStatusLabel } from "@/lib/labels";
import { approvalStatusTone } from "@/lib/status-tone";

const kinds: ApprovalKind[] = [
  "proposal",
  "scope",
  "prototype",
  "staging",
  "production",
  "final_acceptance",
];

export function ProjectApprovals({
  project,
  approvals,
}: {
  project: ProjectDto;
  approvals: ApprovalDto[];
}) {
  const router = useRouter();
  const [kind, setKind] = useState<ApprovalKind>("staging");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function createPending() {
    setPending(true);
    setError(null);
    const response = await apiRequest<ApprovalDto>("/api/approvals", {
      method: "POST",
      body: JSON.stringify({
        projectId: project.id,
        kind,
        comment: comment.trim() || undefined,
      }),
    });
    setPending(false);
    if (response.status !== 201) {
      setError("Não foi possível criar a aprovação");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 md:grid-cols-2">
        <Select value={kind} onChange={(event) => setKind(event.target.value as ApprovalKind)}>
          {kinds.map((value) => (
            <option key={value} value={value}>
              {approvalKindLabel[value]}
            </option>
          ))}
        </Select>
        <Textarea
          className="md:col-span-2"
          placeholder="Observação"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
        <Button disabled={pending} onClick={() => void createPending()}>
          {APPROVAL_CREATE_LABEL}
        </Button>
      </div>
      {error ? <p className="text-sm text-semantic-red">{error}</p> : null}
      {approvals.length === 0 ? (
        <p className="text-sm text-notes-muted">{APPROVALS_EMPTY}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {approvals.map((approval) => (
            <li key={approval.id}>
              <a href={approvalHref(approval.id)} className="flex flex-wrap items-center gap-2">
                <StatusPill tone={approvalStatusTone[approval.status]}>
                  {approvalStatusLabel[approval.status]}
                </StatusPill>
                <span className="text-sm">{approvalKindLabel[approval.kind]}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
