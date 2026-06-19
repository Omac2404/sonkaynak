"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className,
  name,
  value,
  onClick,
  pendingText = "Kaydediliyor…",
}: {
  children: React.ReactNode;
  className?: string;
  name?: string;
  value?: string;
  onClick?: () => void;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} onClick={onClick} disabled={pending} className={className} aria-busy={pending}>
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          {pendingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
