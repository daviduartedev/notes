import { Bell, ChevronDown, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterBar } from "@/components/ui/filter-bar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { StatusPill } from "@/components/ui/status-pill";
import { Textarea } from "@/components/ui/textarea";
import { isDesignSystemEnabled } from "@/lib/design-system";

export default function DesignSystemPage() {
  if (!isDesignSystemEnabled(process.env.NODE_ENV)) {
    notFound();
  }

  return (
    <main className="page-shell max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Design system</h1>
      <p className="text-sm text-notes-muted">
        Casca reta, sem radius. Cor só em destaque (ink nos CTAs, pílulas semânticas). 404 em production.
      </p>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Espaçamento</h2>
        <p className="text-sm text-notes-muted">
          Gutter lateral <code>--page-gutter</code> (2rem) · largura máxima <code>--page-max</code> (72rem).
        </p>
        <div className="border border-notes-border bg-notes-raised p-4 text-sm">
          Shell autenticado: header 48px, nav horizontal, conteúdo IBM Plex Sans.
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Primitivos</h2>
        <FilterBar onSubmit={(event) => event.preventDefault()}>
          <Input placeholder="Input com largura fluida" readOnly />
          <Select defaultValue="">
            <option value="">Todos os responsáveis</option>
            <option value="a">Ana Souza</option>
          </Select>
          <Button type="submit">Filtrar</Button>
        </FilterBar>
        <div className="flex gap-2">
          <Button>Primário</Button>
          <Button pending>Com spinner</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <Textarea readOnly defaultValue="Textarea" />
        <div className="flex flex-wrap gap-2">
          <StatusPill tone="green">verde</StatusPill>
          <StatusPill tone="yellow">amarelo</StatusPill>
          <StatusPill tone="red">vermelho</StatusPill>
          <StatusPill tone="blue">azul</StatusPill>
          <StatusPill tone="purple">roxo</StatusPill>
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Ícones</h2>
        <div className="flex items-center gap-4 text-notes-muted">
          <span className="inline-flex items-center gap-2 text-sm">
            <Bell className="size-4 text-notes-ink" /> Sino
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <ChevronDown className="size-4" /> Chevron
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <ChevronRight className="size-4" /> Avançar
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <Spinner /> Spinner
          </span>
        </div>
      </Card>
    </main>
  );
}
