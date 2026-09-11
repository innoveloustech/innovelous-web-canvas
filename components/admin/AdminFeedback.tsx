"use client";

export function AdminLoading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">{label}</p>
    </div>
  );
}

export function AdminEmpty({ label }: { label: string }) {
  return <p className="py-10 text-center text-xs font-mono uppercase tracking-widest text-neutral-600">{label}</p>;
}

export function adminErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
