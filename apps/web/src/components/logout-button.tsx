"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { API_ORIGIN } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch(`${API_ORIGIN}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" type="button" onClick={() => void logout()}>
      Sair
    </Button>
  );
}
