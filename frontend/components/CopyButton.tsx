"use client";

import { useState } from "react";
import { useToast } from "./Toast";

export function CopyButton({ value, label = "link" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const { show } = useToast();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      show(`Copied ${label} to clipboard`, "success");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      show("Couldn't copy — your browser blocked clipboard access.", "error");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${label} to clipboard`}
      title={`Copy ${label}`}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-ink-raised hover:text-text"
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3.5 8.5l3 3 6-7"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-success"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M3 10.5V3.5a1 1 0 011-1h7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
