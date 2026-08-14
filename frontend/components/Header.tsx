interface HeaderProps {
  onCreateClick: () => void;
}

export function Header({ onCreateClick }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-border px-5 py-5 sm:px-8">
      <div className="flex items-baseline gap-3">
        <h1 className="font-mono text-2xl font-medium tracking-tight text-text">
          hook<span className="text-accent">/</span>
          <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-0.5 animate-blink bg-accent align-middle" />
        </h1>
        <span className="hidden font-body text-sm text-text-muted sm:inline">
          link management, minus the bloat
        </span>
      </div>

      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-accent-hover active:scale-[0.98]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        New link
      </button>
    </header>
  );
}
