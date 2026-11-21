import { CATEGORY_LABELS, type LibraryCategory } from "@/lib/library-categories";

export function MixMeter({
  target,
  actual,
}: {
  target: { category: string; percent: number }[];
  actual: { category: string; percent: number; completed?: number }[];
}) {
  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
      <p className="text-xs tracking-[0.14em] text-[#0e6b66] uppercase">Content mix</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Target vs what you have actually watched in your library.
      </p>
      <ul className="mt-4 space-y-3">
        {target.map((row) => {
          const category = row.category as LibraryCategory;
          const actualRow = actual.find((item) => item.category === row.category);
          const actualPercent = actualRow?.percent ?? 0;
          return (
            <li key={row.category}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium text-[#0a3f3d]">
                  {CATEGORY_LABELS[category] ?? row.category}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {actualPercent}% / {row.percent}%
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-[#efe4d2]">
                <div
                  className="absolute inset-y-0 left-0 bg-[#d7a15e]/70"
                  style={{ width: `${Math.min(100, row.percent)}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 bg-[#0e6b66]"
                  style={{ width: `${Math.min(100, actualPercent)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Teal = actual · gold = target. Mix is guidance, not a lock.
      </p>
    </div>
  );
}
