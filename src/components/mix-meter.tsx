import { CATEGORY_LABELS, type LibraryCategory } from "@/lib/library-categories";

export function MixMeter({
  actual,
  completedTotal,
}: {
  actual: { category: string; percent: number; completed?: number }[];
  completedTotal: number;
}) {
  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
      <p className="text-xs tracking-[0.14em] text-[#0e6b66] uppercase">Content mix</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Share of what you have actually watched — updates as you study.
      </p>
      {completedTotal === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Watch episodes or OSSU lectures and these bars will fill from your usage.
        </p>
      ) : null}
      <ul className="mt-4 space-y-3">
        {actual.map((row) => {
          const category = row.category as LibraryCategory;
          const percent = row.percent ?? 0;
          return (
            <li key={row.category}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium text-[#0a3f3d]">
                  {CATEGORY_LABELS[category] ?? row.category}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {percent}%
                  {row.completed != null && row.completed > 0
                    ? ` · ${row.completed}`
                    : ""}
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-[#efe4d2]">
                <div
                  className="absolute inset-y-0 left-0 bg-[#0e6b66] transition-[width]"
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Based on watched library episodes plus OSSU lectures (Programs).
      </p>
    </div>
  );
}
