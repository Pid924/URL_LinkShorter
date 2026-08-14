export function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-border bg-ink-surface px-6 py-16 text-center">
      <p className="font-mono text-sm text-text-faint">
        https://your-really-long-url.com/... <span className="text-accent">→</span> hook/••••••
      </p>
      <h2 className="mt-4 font-display text-lg font-semibold text-text">No links yet</h2>
      <p className="mt-1.5 max-w-sm font-body text-sm text-text-muted">
        Create your first short link to see it tracked here — clicks, timestamps, and all.
      </p>
      <button
        onClick={onCreateClick}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-accent-hover active:scale-[0.98]"
      >
        Create a link
      </button>
    </div>
  );
}
