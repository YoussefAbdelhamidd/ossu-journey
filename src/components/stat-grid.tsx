function Bar({ done, total }: { done: number; total: number }) {
  const percent = total === 0 ? 0 : Math.min(100, (done / total) * 100);
  return (
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e7dccb]">
      <div className="h-full rounded-full bg-[#0e6b66]" style={{ width: `${percent}%` }} />
    </div>
  );
}

export function StatGrid({
  items,
}: {
  items: { label: string; value: string; done?: number; total?: number }[];
}) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 text-lg leading-snug font-semibold tabular-nums text-[#0a3f3d]">{item.value}</dd>
          {item.total != null && item.done != null ? <Bar done={item.done} total={item.total} /> : null}
        </div>
      ))}
    </dl>
  );
}
