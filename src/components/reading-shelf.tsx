function kindLabel(kind: string) {
  if (kind === "open_pdf") return "Open PDF";
  if (kind === "purchase") return "Purchase";
  return "Free online";
}

export function ReadingShelf({
  readings,
}: {
  readings: {
    id: string;
    title: string;
    author: string | null;
    kind: string;
    url: string;
    summary: string | null;
  }[];
}) {
  if (readings.length === 0) return null;
  return (
    <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
      <h2 className="text-xl text-[#0a3f3d]">Reading shelf</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Companion books for this course. Open copies when the author published them that way;
        otherwise a purchase page.
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {readings.map((reading) => (
          <li
            key={reading.id}
            className="rounded-xl border border-border/80 bg-[#fffaf3] px-4 py-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-medium text-[#0a3f3d]">{reading.title}</h3>
              <span className="text-xs tracking-[0.12em] text-[#0e6b66] uppercase">
                {kindLabel(reading.kind)}
              </span>
            </div>
            {reading.author ? (
              <p className="mt-1 text-sm text-muted-foreground">{reading.author}</p>
            ) : null}
            {reading.summary ? (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {reading.summary}
              </p>
            ) : null}
            <a
              href={reading.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-[#0e6b66] underline-offset-4 hover:underline"
            >
              Open link
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
