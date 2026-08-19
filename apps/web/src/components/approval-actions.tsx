"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type { ApprovalAction, ApprovalDto } from "@/lib/domain-types";
import { approvalActionLabel } from "@/lib/labels";

export function ApprovalActions({ approval }: { approval: ApprovalDto }) {
  const router = useRouter();
  const [comment, setComment] = useState(approval.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<ApprovalAction | null>(null);

  async function run(action: ApprovalAction) {
    setPendingAction(action);
    setError(null);
    const response = await apiRequest<ApprovalDto>(`/api/approvals/${approval.id}/decide`, {
      method: "POST",
      body: JSON.stringify({
        action,
        comment: comment.trim() ? comment : undefined,
      }),
    });
    setPendingAction(null);
    if (response.status !== 200) {
      setError("Decisão não permitida");
      return;
    }
    router.refresh();
  }

  if (approval.allowedActions.length === 0) {
    return <p className="text-sm text-notes-muted">Estado terminal.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        placeholder="Observação"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {approval.allowedActions.map((action) => (
          <Button
            key={action}
            disabled={pendingAction !== null}
            onClick={() => void run(action)}
          >
            {pendingAction === action ? "…" : approvalActionLabel[action]}
          </Button>
        ))}
      </div>
      {error ? <p className="text-sm text-semantic-red">{error}</p> : null}
    </div>
  );
}
