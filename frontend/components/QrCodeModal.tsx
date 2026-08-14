"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "./Toast";

interface QrCodeModalProps {
  shortUrl: string;
  shortCode: string;
  onClose: () => void;
}

export function QrCodeModal({ shortUrl, shortCode, onClose }: QrCodeModalProps) {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const { show } = useToast();

  function handleDownload() {
    const canvas = canvasWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `hook-${shortCode}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    show("QR code downloaded", "success");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="QR code"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs animate-pop-in rounded-xl border border-ink-border bg-ink-surface p-6 text-center shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-xs text-text-muted">hook/{shortCode}</p>

        <div
          ref={canvasWrapperRef}
          className="mx-auto mt-4 inline-flex rounded-lg bg-white p-3"
        >
          <QRCodeCanvas value={shortUrl} size={192} level="M" includeMargin={false} />
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-ink-border px-4 py-2 font-body text-sm font-medium text-text-muted transition-colors hover:bg-ink-raised hover:text-text"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 rounded-lg bg-accent px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
