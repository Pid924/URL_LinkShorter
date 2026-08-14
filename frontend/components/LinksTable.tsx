"use client";

import { ShortLink } from "@/lib/types";
import { LinkRow } from "./LinkRow";
import { LinkCard } from "./LinkCard";

interface LinksTableProps {
  links: ShortLink[];
  onToggle: (id: number, next: boolean) => void;
  onEdit: (link: ShortLink) => void;
  onShowQr: (link: ShortLink) => void;
  onDelete: (id: number) => Promise<void>;
}

const COLUMNS = [
  "Original URL",
  "Short link",
  "Created",
  "Modified",
  "Last used",
  "Uses",
  "Status",
  "Actions",
];

export function LinksTable({ links, onToggle, onEdit, onShowQr, onDelete }: LinksTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-ink-border bg-ink-surface md:block">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-ink-border">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 font-body text-[11px] font-semibold uppercase tracking-wider text-text-faint"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <LinkRow
                key={link.id}
                link={link}
                shortUrl={link.shortUrl}
                onToggle={(next) => onToggle(link.id, next)}
                onEdit={() => onEdit(link)}
                onShowQr={() => onShowQr(link)}
                onDelete={() => onDelete(link.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {links.map((link) => (
          <LinkCard
            key={link.id}
            link={link}
            shortUrl={link.shortUrl}
            onToggle={(next) => onToggle(link.id, next)}
            onEdit={() => onEdit(link)}
            onShowQr={() => onShowQr(link)}
            onDelete={() => onDelete(link.id)}
          />
        ))}
      </div>
    </>
  );
}
