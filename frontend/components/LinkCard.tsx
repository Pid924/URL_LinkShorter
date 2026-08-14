"use client";

import { useState } from "react";
import { ShortLink } from "@/lib/types";
import { formatAbsolute, formatRelative } from "@/lib/format";
import { EnabledToggle } from "./EnabledToggle";
import { CopyButton } from "./CopyButton";
import { PlatformBadges } from "./PlatformBadges";

interface LinkCardProps {
  link: ShortLink;
  shortUrl: string;
  onToggle: (next: boolean) => void;
  onEdit: () => void;
  onShowQr: () => void;
  onDelete: () => Promise<void>;
}

export function LinkCard({ link, shortUrl, onToggle, onEdit, onShowQr, onDelete }: LinkCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmDelete() {
    setDeleting(true);
    await onDelete();
  }

  return (
    <div className="rounded-xl border border-ink-border bg-ink-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-accent-soft px-2.5 py-1 font-mono text-xs text-accent">
              {link.shortCode}
            </span>
            <PlatformBadges iosUrl={link.iosUrl} androidUrl={link.androidUrl} />
          </div>
          <a
            href={link.originalUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block truncate font-body text-sm text-text hover:text-accent"
            title={link.originalUrl}
          >
            {link.originalUrl}
          </a>
        </div>
        <EnabledToggle enabled={link.isEnabled} onChange={onToggle} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4 font-mono text-xs text-text-muted">
        <div>
          <dt className="text-text-faint">Created</dt>
          <dd title={formatAbsolute(link.createdDate)}>{formatRelative(link.createdDate)}</dd>
        </div>
        <div>
          <dt className="text-text-faint">Modified</dt>
          <dd title={formatAbsolute(link.modifiedDate)}>{formatRelative(link.modifiedDate)}</dd>
        </div>
        <div>
          <dt className="text-text-faint">Last used</dt>
          <dd title={formatAbsolute(link.lastUsedDate)}>{formatRelative(link.lastUsedDate)}</dd>
        </div>
        <div>
          <dt className="text-text-faint">Uses</dt>
          <dd className="text-text">{link.totalUsed}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-ink-border pt-3">
        {confirmingDelete ? (
          <div className="flex w-full items-center gap-2">
            <button onClick={handleConfirmDelete} disabled={deleting}
              className="flex-1 rounded-md bg-danger py-1.5 font-body text-xs font-semibold text-white hover:bg-danger/90 disabled:opacity-60">
              {deleting ? "Deleting…" : "Confirm delete"}
            </button>
            <button onClick={() => setConfirmingDelete(false)} disabled={deleting}
              className="flex-1 rounded-md border border-ink-border py-1.5 font-body text-xs font-medium text-text-muted">
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <CopyButton value={shortUrl} label="short link" />
            <button onClick={onShowQr} aria-label="Show QR code"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-ink-raised hover:text-text">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="9.5" y="2" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="2" y="9.5" width="4.5" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="10" y="10" width="1.5" height="1.5" fill="currentColor"/>
                <rect x="13" y="10" width="1" height="1" fill="currentColor"/>
                <rect x="10" y="13" width="1" height="1" fill="currentColor"/>
                <rect x="13" y="13" width="1" height="1" fill="currentColor"/>
              </svg>
            </button>
            <button onClick={onEdit} aria-label="Edit link"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-ink-raised hover:text-text">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M11 2.5l2.5 2.5L5 13.5H2.5V11L11 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
        {!confirmingDelete && (
          <button onClick={() => setConfirmingDelete(true)} aria-label="Delete link"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-danger-soft hover:text-danger">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 4.5h10M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M4.5 4.5l.5 8.5a1 1 0 001 1h4a1 1 0 001-1l.5-8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
