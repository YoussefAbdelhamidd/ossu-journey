import Link from "next/link";

export type PathItem = {
  id: string;
  number: number;
  title: string;
  href: string;
  state: "done" | "current" | "upcoming" | "locked";
};

const stateLabel = {
  done: "Done",
  current: "Current",
  upcoming: "Later",
  locked: "Locked",
} as const;

export function CoursePath({
  courseTitle,
  courseHref,
  percent,
  items,
}: {
  courseTitle: string;
  courseHref?: string;
  percent: number;
  items: PathItem[];
}) {
  if (items.length === 0) return null;
  const current = items.find((item) => item.state === "current");

  return (
    <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10" aria-label="Course path">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs tracking-[0.14em] text-[#0e6b66] uppercase">This course</p>
          {courseHref ? (
            <Link href={courseHref} className="mt-1 block text-xl text-[#0a3f3d] hover:underline">
              {courseTitle}
            </Link>
          ) : (
            <h2 className="mt-1 text-xl text-[#0a3f3d]">{courseTitle}</h2>
          )}
          {current ? (
            <p className="mt-1 truncate text-sm text-muted-foreground">
              Now: Lecture {current.number} · {current.title}
            </p>
          ) : null}
        </div>
        <p className="text-sm tabular-nums text-muted-foreground">{percent}%</p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e7dccb]">
        <div
          className="h-full rounded-full bg-[#0e6b66] transition-[width]"
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <ol className="mt-4 flex gap-1.5 overflow-x-auto pb-1 sm:grid sm:grid-cols-13 sm:overflow-visible sm:[grid-template-columns:repeat(13,minmax(0,1fr))]">
        {items.map((item) => (
          <li key={item.id} className="shrink-0 sm:shrink">
            {item.state === "locked" ? (
              <span
                title={`Lecture ${item.number}: ${item.title}. ${stateLabel[item.state]}.`}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#efe6d6]/70 text-sm font-medium text-[#8a8174] tabular-nums sm:w-auto"
              >
                {item.number}
              </span>
            ) : (
              <Link
                href={item.href}
                aria-current={item.state === "current" ? "step" : undefined}
                title={`Lecture ${item.number}: ${item.title}. ${stateLabel[item.state]}.`}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium tabular-nums sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e6b66] ${
                  item.state === "done"
                    ? "bg-[#0e6b66] text-[#f6f3ea]"
                    : item.state === "current"
                      ? "bg-[#fffaf3] text-[#0a3f3d] ring-2 ring-[#0e6b66]"
                      : "bg-[#efe6d6] text-[#5e564a] hover:bg-[#e7dccb]"
                }`}
              >
                {item.number}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          <span className="mr-1 inline-block size-2 rounded-sm bg-[#0e6b66]" />
          Done
        </span>
        <span>
          <span className="mr-1 inline-block size-2 rounded-sm ring-2 ring-[#0e6b66] ring-offset-1" />
          Current
        </span>
        <span>
          <span className="mr-1 inline-block size-2 rounded-sm bg-[#efe6d6]" />
          Later / locked
        </span>
      </div>
    </section>
  );
}
