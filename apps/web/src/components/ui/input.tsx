import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-md border border-notes-border bg-notes-raised px-3 py-2 text-sm text-notes-text placeholder:text-notes-muted outline-none focus:border-semantic-blue ${className}`}
      {...props}
    />
  );
}
