import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Card>
        <h1 className="font-display text-4xl">Notes</h1>
        <p className="mt-1 text-sm text-notes-muted">Acesse o quadro operacional.</p>
        <LoginForm />
      </Card>
    </main>
  );
}
