import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`min-w-[16rem] max-w-full flex-1 rounded-none border border-notes-border bg-notes-raised px-3 py-2 text-sm text-notes-text placeholder:text-notes-muted outline-none focus:border-notes-ink ${className}`}
      {...props}
    />
  );
}
