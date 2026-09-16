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

export function AdminError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-white text-sm font-medium mb-1">Failed to load data</p>
      <p className="text-neutral-400 text-xs max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-wider font-semibold rounded-xl border border-white/10 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
