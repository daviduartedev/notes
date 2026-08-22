"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(body?.error ?? "Não foi possível entrar");
        return;
      }
      router.push("/hoje");
      router.refresh();
    } catch {
      setError("Não foi possível entrar");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
      <label className="flex flex-col gap-1 text-sm">
        E-mail
        <Input name="email" type="email" autoComplete="username" required className="min-w-0" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Senha
        <Input name="password" type="password" autoComplete="current-password" required className="min-w-0" />
      </label>
      {error ? <p className="text-sm text-semantic-red">{error}</p> : null}
      <Button type="submit" pending={pending}>
        Entrar
      </Button>
    </form>
  );
}
