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
    <form className="flex flex-col gap-2" onSubmit={(event) => void onSave(event)}>
      <label className="flex items-center gap-2 text-[12px] text-notes-muted">
        {ATTENTION_LEAD_LABEL}
        <Input
          name="attentionLeadDays"
          type="number"
          min={0}
          max={30}
          defaultValue={workspace.attentionLeadDays}
          required
          className="min-w-0 w-14 flex-none px-2 py-1 text-center"
        />
        <Button type="submit" pending={pending} className="px-3 py-1 text-[12px]">
          Salvar
        </Button>
      </label>
      {error ? (
        <p className="text-[12px] text-semantic-red">{error}</p>
      ) : (
        <p className="text-[11px] text-notes-muted">{ATTENTION_LEAD_HINT}</p>
      )}
    </form>
  );
}
