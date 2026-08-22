import type { FormHTMLAttributes } from "react";

export function FilterBar({ className = "", children, ...props }: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form className={`flex flex-wrap items-end gap-3 ${className}`} {...props}>
      {children}
    </form>
  );
}
