"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import type { BlockerAction, BlockerDto } from "@/lib/domain-types";
import { blockerActionLabel } from "@/lib/labels";

export function BlockerActions({ blocker }: { blocker: BlockerDto }) {
  const router = useRouter();
  const [notes, setNotes] = useState(blocker.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<BlockerAction | null>(null);

  async function run(action: BlockerAction) {
    setPendingAction(action);
    setError(null);
    const response = await apiRequest<BlockerDto>(`/api/blockers/${blocker.id}/decide`, {
      method: "POST",
      body: JSON.stringify({
        action,
        notes: notes.trim() ? notes : undefined,
      }),
    });
    setPendingAction(null);
    if (response.status !== 200) {
      setError("Decisão não permitida");
      return;
    }
    router.refresh();
  }

  if (blocker.allowedActions.length === 0) {
    return <p className="text-sm text-notes-muted">Estado terminal.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        placeholder="Observação"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {blocker.allowedActions.map((action) => (
          <Button
            key={action}
            disabled={pendingAction !== null}
            onClick={() => void run(action)}
          >
            {pendingAction === action ? "…" : blockerActionLabel[action]}
          </Button>
        ))}
      </div>
      {error ? <p className="text-sm text-semantic-red">{error}</p> : null}
    </div>
  );
}
