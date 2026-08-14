interface PlatformBadgesProps {
  iosUrl: string | null;
  androidUrl: string | null;
}

export function PlatformBadges({ iosUrl, androidUrl }: PlatformBadgesProps) {
  if (!iosUrl && !androidUrl) return null;

  return (
    <span className="flex items-center gap-1">
      {iosUrl && (
        <a
          href={iosUrl}
          target="_blank"
          rel="noreferrer"
          title={`iOS → ${iosUrl}`}
          className="inline-flex h-5 w-5 items-center justify-center rounded bg-text/10 font-mono text-[10px] text-text-muted hover:bg-accent-soft hover:text-accent"
        >
          
        </a>
      )}
      {androidUrl && (
        <a
          href={androidUrl}
          target="_blank"
          rel="noreferrer"
          title={`Android → ${androidUrl}`}
          className="inline-flex h-5 w-5 items-center justify-center rounded bg-text/10 font-mono text-[10px] text-text-muted hover:bg-accent-soft hover:text-accent"
        >
          🤖
        </a>
      )}
    </span>
  );
}
