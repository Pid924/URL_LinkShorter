"use client";

import { useState } from "react";
import { ShortLink } from "@/lib/types";
import {
  API_BASE_URL,
  ApiRequestError,
  deleteLinkRequest,
  fetchLinks,
  updateLinkRequest,
} from "@/lib/api-client";
import { Header } from "./Header";
import { StatsBar } from "./StatsBar";
import { LinksTable } from "./LinksTable";
import { EmptyState } from "./EmptyState";
import { LinkDrawer } from "./LinkDrawer";
import { QrCodeModal } from "./QrCodeModal";
import { useToast } from "./Toast";

export function Dashboard({
  initialLinks,
  initialError,
}: {
  initialLinks: ShortLink[];
  initialError: string | null;
}) {
  const [links, setLinks] = useState<ShortLink[]>(initialLinks);
  const [apiError, setApiError] = useState<string | null>(initialError);
  const [refreshing, setRefreshing] = useState(false);
  const [drawer, setDrawer] = useState<{ mode: "create" | "edit"; link?: ShortLink } | null>(null);
  const [qrLink, setQrLink] = useState<ShortLink | null>(null);
  const { show } = useToast();

  async function refresh() {
    setRefreshing(true);
    try {
      const latest = await fetchLinks();
      setLinks(latest);
      setApiError(null);
    } catch {
      setApiError("Couldn't reach the API. Make sure it's running and CORS is configured.");
    } finally {
      setRefreshing(false);
    }
  }

  function handleSaved(link: ShortLink, mode: "create" | "edit") {
    setLinks((prev) => {
      if (mode === "create") return [link, ...prev];
      return prev.map((l) => (l.id === link.id ? link : l));
    });
    setDrawer(null);
  }

  async function handleToggle(id: number, next: boolean) {
    const previous = links;
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, isEnabled: next } : l)));
    try {
      await updateLinkRequest(id, { isEnabled: next });
      show(next ? "Link enabled" : "Link disabled", "success");
    } catch (err) {
      setLinks(previous);
      show(err instanceof ApiRequestError ? err.message : "Couldn't update link.", "error");
    }
  }

  async function handleDelete(id: number) {
    const previous = links;
    try {
      await deleteLinkRequest(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
      show("Link deleted", "success");
    } catch (err) {
      setLinks(previous);
      show(err instanceof ApiRequestError ? err.message : "Couldn't delete link.", "error");
    }
  }

  return (
    <div className="min-h-screen bg-ink">
      <Header onCreateClick={() => setDrawer({ mode: "create" })} />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-6 sm:px-8 sm:py-8">
        {apiError && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3">
            <div>
              <p className="font-body text-sm font-medium text-danger">{apiError}</p>
              <p className="mt-0.5 font-mono text-xs text-danger/80">API_BASE_URL={API_BASE_URL}</p>
            </div>
            <button
              onClick={refresh}
              disabled={refreshing}
              className="rounded-md border border-danger/40 px-3 py-1.5 font-body text-xs font-semibold text-danger transition-colors hover:bg-danger/10 disabled:opacity-60"
            >
              {refreshing ? "Retrying…" : "Retry"}
            </button>
          </div>
        )}

        <StatsBar links={links} />

        {links.length === 0 ? (
          <EmptyState onCreateClick={() => setDrawer({ mode: "create" })} />
        ) : (
          <LinksTable
            links={links}
            onToggle={handleToggle}
            onEdit={(link) => setDrawer({ mode: "edit", link })}
            onShowQr={(link) => setQrLink(link)}
            onDelete={handleDelete}
          />
        )}
      </main>

      {drawer && (
        <LinkDrawer
          mode={drawer.mode}
          link={drawer.link}
          onClose={() => setDrawer(null)}
          onSaved={(link, mode) => {
            handleSaved(link, mode);
            void refresh();
          }}
        />
      )}

      {qrLink && (
        <QrCodeModal
          shortUrl={qrLink.shortUrl}
          shortCode={qrLink.shortCode}
          onClose={() => setQrLink(null)}
        />
      )}
    </div>
  );
}
