import { ShortLink } from "@/lib/types";

export function StatsBar({ links }: { links: ShortLink[] }) {
  const total = links.length;
  const active = links.filter((l) => l.isEnabled).length;
  const totalClicks = links.reduce((sum, l) => sum + l.totalUsed, 0);

  const stats = [
    { label: "total links", value: total },
    { label: "active", value: active },
    { label: "total clicks", value: totalClicks },
  ];

  return (
    <div className="grid grid-cols-3 divide-x divide-ink-border rounded-xl border border-ink-border bg-ink-surface">
      {stats.map((stat) => (
        <div key={stat.label} className="px-4 py-4 sm:px-6">
          <div className="font-mono text-2xl font-medium text-text sm:text-3xl">{stat.value}</div>
          <div className="mt-1 font-body text-[11px] uppercase tracking-wider text-text-muted sm:text-xs">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
