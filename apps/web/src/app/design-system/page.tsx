import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { isDesignSystemEnabled } from "@/lib/design-system";

export default function DesignSystemPage() {
  if (!isDesignSystemEnabled(process.env.NODE_ENV)) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12">
      <h1 className="font-display text-4xl">Design system</h1>
      <p className="text-sm text-notes-muted">Primitivos do C0 — sem board operacional.</p>
      <Card className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Input
          <Input placeholder="placeholder" readOnly />
        </label>
        <div className="flex gap-2">
          <Button>Primário</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill tone="green">verde</StatusPill>
          <StatusPill tone="yellow">amarelo</StatusPill>
          <StatusPill tone="red">vermelho</StatusPill>
          <StatusPill tone="blue">azul</StatusPill>
          <StatusPill tone="purple">roxo</StatusPill>
        </div>
      </Card>
    </main>
  );
}
