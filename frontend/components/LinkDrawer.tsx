"use client";

import { FormEvent, useEffect, useState } from "react";
import clsx from "clsx";
import { ShortLink } from "@/lib/types";
import { ApiRequestError, createLinkRequest, updateLinkRequest } from "@/lib/api-client";
import { useToast } from "./Toast";

interface LinkDrawerProps {
  mode: "create" | "edit";
  link?: ShortLink;
  onClose: () => void;
  onSaved: (link: ShortLink, mode: "create" | "edit") => void;
}

export function LinkDrawer({ mode, link, onClose, onSaved }: LinkDrawerProps) {
  const [originalUrl, setOriginalUrl] = useState(link?.originalUrl ?? "");
  const [iosUrl, setIosUrl] = useState(link?.iosUrl ?? "");
  const [androidUrl, setAndroidUrl] = useState(link?.androidUrl ?? "");
  const [codeMode, setCodeMode] = useState<"auto" | "custom">("auto");
  const [customCode, setCustomCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { show } = useToast();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "create") {
        const created = await createLinkRequest({
          originalUrl,
          iosUrl: iosUrl.trim() || undefined,
          androidUrl: androidUrl.trim() || undefined,
          customCode: codeMode === "custom" ? customCode.trim() : undefined,
        });
        show(`Created hook/${created.shortCode}`, "success");
        onSaved(created, "create");
      } else if (link) {
        const updated = await updateLinkRequest(link.id, {
          originalUrl: originalUrl !== link.originalUrl ? originalUrl : undefined,
          iosUrl: iosUrl.trim() || undefined,
          androidUrl: androidUrl.trim() || undefined,
          clearIosUrl: !iosUrl.trim() && !!link.iosUrl,
          clearAndroidUrl: !androidUrl.trim() && !!link.androidUrl,
        });
        show("Link updated", "success");
        onSaved(updated, "edit");
      }
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 animate-fade-in">
      <button aria-label="Close panel" className="absolute inset-0 cursor-default" onClick={onClose} />

      <div className="relative flex h-full w-full max-w-md animate-slide-in flex-col border-l border-ink-border bg-ink-surface shadow-panel">
        <div className="flex items-center justify-between border-b border-ink-border px-6 py-5">
          <h2 className="font-display text-lg font-semibold text-text">
            {mode === "create" ? "New link" : "Edit link"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-ink-raised hover:text-text"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-5">

            {/* Default URL */}
            <div>
              <label htmlFor="originalUrl" className="font-body text-sm font-medium text-text">
                Default URL <span className="text-text-faint">(desktop &amp; fallback)</span>
              </label>
              <input
                id="originalUrl"
                type="url"
                required
                autoFocus
                placeholder="https://example.com"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="mt-2 w-full rounded-lg border border-ink-border bg-ink px-3.5 py-2.5 font-mono text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
              />
            </div>

            {/* Platform overrides */}
            <div className="rounded-lg border border-ink-border bg-ink p-4">
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-text-faint">
                Platform overrides <span className="ml-1 font-normal normal-case tracking-normal">optional</span>
              </p>
              <p className="mt-1 font-body text-xs text-text-faint">
                Visitors on iOS or Android are redirected to these URLs instead. Falls back to the default URL if left empty.
              </p>

              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <label htmlFor="iosUrl" className="flex items-center gap-2 font-body text-sm font-medium text-text">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-text/10 font-mono text-[10px]"></span>
                    iOS URL
                  </label>
                  <input
                    id="iosUrl"
                    type="url"
                    placeholder="https://apps.apple.com/app/…"
                    value={iosUrl}
                    onChange={(e) => setIosUrl(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-ink-border bg-ink-surface px-3.5 py-2.5 font-mono text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="androidUrl" className="flex items-center gap-2 font-body text-sm font-medium text-text">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-text/10 font-mono text-[10px]">🤖</span>
                    Android URL
                  </label>
                  <input
                    id="androidUrl"
                    type="url"
                    placeholder="https://play.google.com/store/apps/…"
                    value={androidUrl}
                    onChange={(e) => setAndroidUrl(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-ink-border bg-ink-surface px-3.5 py-2.5 font-mono text-sm text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Short code (create only) */}
            {mode === "create" && (
              <div>
                <span className="font-body text-sm font-medium text-text">Short code</span>
                <div className="mt-2 inline-flex rounded-lg border border-ink-border bg-ink p-1">
                  {(["auto", "custom"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCodeMode(option)}
                      className={clsx(
                        "rounded-md px-3.5 py-1.5 font-body text-sm font-medium transition-colors",
                        codeMode === option ? "bg-accent text-white" : "text-text-muted hover:text-text"
                      )}
                    >
                      {option === "auto" ? "Auto-generate" : "Custom"}
                    </button>
                  ))}
                </div>

                {codeMode === "custom" && (
                  <div className="mt-3">
                    <div className="flex items-center overflow-hidden rounded-lg border border-ink-border bg-ink focus-within:border-accent">
                      <span className="pl-3.5 font-mono text-sm text-text-faint">hook/</span>
                      <input
                        type="text"
                        required
                        placeholder="promo2026"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        className="w-full bg-transparent py-2.5 pr-3.5 font-mono text-sm text-text placeholder:text-text-faint focus:outline-none"
                      />
                    </div>
                    <p className="mt-1.5 font-body text-xs text-text-faint">
                      3–20 characters: letters, numbers, - or _
                    </p>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger-soft px-3.5 py-2.5 font-body text-sm text-danger">
                {error}
              </div>
            )}
          </div>

          <div className="mt-auto flex gap-3 pt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-ink-border px-4 py-2.5 font-body text-sm font-medium text-text-muted transition-colors hover:bg-ink-raised hover:text-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-accent px-4 py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {submitting ? "Saving…" : mode === "create" ? "Create link" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
