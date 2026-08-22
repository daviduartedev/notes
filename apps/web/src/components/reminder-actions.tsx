"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import type { ReminderAction, ReminderDto } from "@/lib/domain-types";
import { reminderActionLabel } from "@/lib/labels";
import { REMINDER_COPIED, REMINDER_COPY_LABEL } from "@/lib/reminder-copy";

export function ReminderActions({ reminder }: { reminder: ReminderDto }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pendingAction, setPendingAction] = useState<ReminderAction | "copy" | null>(null);

  async function copyDraft() {
    setPendingAction("copy");
    setError(null);
    try {
      await navigator.clipboard.writeText(reminder.draftMessage);
      setCopied(true);
    } catch {
      setError("Não foi possível copiar");
    }
    setPendingAction(null);
  }

  async function run(action: ReminderAction) {
    setPendingAction(action);
    setError(null);
    const response = await apiRequest<ReminderDto>(`/api/reminders/${reminder.id}/decide`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
    setPendingAction(null);
    if (response.status !== 200) {
      setError("Decisão não permitida");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <pre className="whitespace-pre-wrap border border-notes-border bg-notes-raised p-3 text-sm">
        {reminder.draftMessage}
      </pre>
      <div className="flex flex-wrap gap-2">
        <Button disabled={pendingAction !== null} pending={pendingAction === "copy"} onClick={() => void copyDraft()}>
          {copied ? REMINDER_COPIED : REMINDER_COPY_LABEL}
        </Button>
        {reminder.allowedActions.map((action) => (
          <Button
            key={action}
            disabled={pendingAction !== null}
            pending={pendingAction === action}
            onClick={() => void run(action)}
          >
            {reminderActionLabel[action]}
          </Button>
        ))}
      </div>
      {error ? <p className="text-sm text-semantic-red">{error}</p> : null}
    </div>
  );
}
