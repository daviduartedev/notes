import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "@/components/ui/spinner";

type Variant = "primary" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-notes-ink text-white hover:opacity-90 disabled:opacity-40",
  ghost:
    "bg-transparent text-notes-text border border-notes-border hover:bg-notes-raised disabled:opacity-40",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  pending?: boolean;
};

export function Button({
  variant = "primary",
  pending = false,
  className = "",
  type = "button",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || pending}
      aria-busy={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-none px-4 py-2 text-sm font-medium transition ${variants[variant]} ${className}`}
      {...props}
    >
      {pending ? <Spinner /> : null}
      {children}
    </button>
  );
}
