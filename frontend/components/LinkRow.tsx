"use client";

import { useState } from "react";
import { ShortLink } from "@/lib/types";
import { formatAbsolute, formatRelative } from "@/lib/format";
import { EnabledToggle } from "./EnabledToggle";
import { CopyButton } from "./CopyButton";
import { PlatformBadges } from "./PlatformBadges";

interface LinkRowProps {
  link: ShortLink;
  shortUrl: string;
  onToggle: (next: boolean) => void;
  onEdit: () => void;
  onShowQr: () => void;
  onDelete: () => Promise<void>;
}

export function LinkRow({ link, shortUrl, onToggle, onEdit, onShowQr, onDelete }: LinkRowProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmDelete() {
    setDeleting(true);
    await onDelete();
  }

  return (
    <tr className="border-b border-ink-border last:border-0 hover:bg-ink-raised/50">
      <td className="max-w-[220px] px-4 py-3.5">
        <a
          href={link.originalUrl}
          target="_blank"
          rel="noreferrer"
          title={link.originalUrl}
          className="block truncate font-body text-sm text-text hover:text-accent"
        >
          {link.originalUrl}
        </a>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-accent-soft px-2.5 py-1 font-mono text-xs text-accent">
            {link.shortCode}
          </span>
          <PlatformBadges iosUrl={link.iosUrl} androidUrl={link.androidUrl} />
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3.5" title={formatAbsolute(link.createdDate)}>
        <span className="font-mono text-xs text-text-muted">{formatRelative(link.createdDate)}</span>
      </td>
      <td className="whitespace-nowrap px-4 py-3.5" title={formatAbsolute(link.modifiedDate)}>
        <span className="font-mono text-xs text-text-muted">{formatRelative(link.modifiedDate)}</span>
      </td>
      <td className="whitespace-nowrap px-4 py-3.5" title={formatAbsolute(link.lastUsedDate)}>
        <span className="font-mono text-xs text-text-muted">{formatRelative(link.lastUsedDate)}</span>
      </td>
      <td className="whitespace-nowrap px-4 py-3.5">
        <span className="font-mono text-xs text-text">{link.totalUsed}</span>
      </td>
      <td className="whitespace-nowrap px-4 py-3.5">
        <EnabledToggle enabled={link.isEnabled} onChange={onToggle} />
      </td>
      <td className="whitespace-nowrap px-4 py-3.5">
        {confirmingDelete ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="rounded-md bg-danger px-2.5 py-1 font-body text-xs font-semibold text-white hover:bg-danger/90 disabled:opacity-60"
            >
              {deleting ? "…" : "Confirm"}
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              className="rounded-md px-2.5 py-1 font-body text-xs font-medium text-text-muted hover:bg-ink-raised"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-0.5">
            <CopyButton value={shortUrl} label="short link" />
            <button onClick={onShowQr} aria-label="Show QR code" title="QR code"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-ink-raised hover:text-text">
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
            <button onClick={onEdit} aria-label="Edit link" title="Edit"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-ink-raised hover:text-text">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M11 2.5l2.5 2.5L5 13.5H2.5V11L11 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={() => setConfirmingDelete(true)} aria-label="Delete link" title="Delete"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-danger-soft hover:text-danger">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 4.5h10M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M4.5 4.5l.5 8.5a1 1 0 001 1h4a1 1 0 001-1l.5-8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
