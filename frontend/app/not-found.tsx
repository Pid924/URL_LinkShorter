export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="max-w-md rounded-xl border border-ink-border bg-ink-surface p-8 text-center shadow-panel">
        <p className="font-mono text-sm text-danger">404/not-found</p>
        <h1 className="mt-3 font-display text-xl font-semibold text-text">
          Nothing lives at this route
        </h1>
        <p className="mt-2 font-body text-sm text-text-muted">
          Short links themselves are served by the API, not this dashboard — check the address, or
          head back and manage your links from here.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 font-body text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Go to dashboard
        </a>
      </div>
    </main>
  );
}
