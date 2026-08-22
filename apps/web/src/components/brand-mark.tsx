export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="16" height="16" stroke="currentColor" strokeWidth="1.4" />
        <path d="M6 9h6M10 6l3 3-3 3" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight">Notes</span>
    </span>
  );
}
