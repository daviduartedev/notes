"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import type { WorkspaceDto } from "@/lib/domain-types";
import { ATTENTION_LEAD_HINT, ATTENTION_LEAD_LABEL } from "@/lib/hoje-copy";

export function AttentionLeadForm({ workspace }: { workspace: WorkspaceDto }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    const response = await apiRequest<WorkspaceDto>("/api/workspace", {
      method: "PATCH",
      body: JSON.stringify({
        attentionLeadDays: Number(data.get("attentionLeadDays")),
      }),
    });
    setPending(false);
    if (response.status !== 200) {
      setError("Não foi possível salvar a antecedência.");
      return;
    }
    router.refresh();
  }

  return (
    <form className="flex min-w-0 flex-col gap-2" onSubmit={(event) => void onSave(event)}>
      <p className="text-[12px] text-notes-muted">{ATTENTION_LEAD_LABEL}</p>
      <div className="flex min-w-0 items-center gap-2">
        <Input
          name="attentionLeadDays"
          type="number"
          min={0}
          max={30}
          defaultValue={workspace.attentionLeadDays}
          required
          className="!w-16 !min-w-0 !max-w-16 flex-none px-2 py-1 text-center"
        />
        <Button type="submit" pending={pending} className="shrink-0 px-3 py-1 text-[12px]">
          Salvar
        </Button>
      </div>
      {error ? (
        <p className="text-[11px] leading-snug text-semantic-red">{error}</p>
      ) : (
        <p className="text-[11px] leading-snug text-notes-muted">{ATTENTION_LEAD_HINT}</p>
      )}
    </form>
  );
}
