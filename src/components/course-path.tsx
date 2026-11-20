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
  percent,
  items,
}: {
  courseTitle: string;
  percent: number;
  items: PathItem[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10" aria-label="Course path">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl text-[#0a3f3d]">{courseTitle}</h2>
        <p className="text-sm tabular-nums text-muted-foreground">{percent}% of this course</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7dccb]">
        <div className="h-full rounded-full bg-[#0e6b66]" style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <ol className="mt-4 grid grid-cols-7 gap-2 sm:[grid-template-columns:repeat(13,minmax(0,1fr))]">
        {items.map((item) => (
          <li key={item.id}>
            {item.state === "locked" ? (
              <span
                title={`Lecture ${item.number}: ${item.title}. ${stateLabel[item.state]}.`}
                className="flex h-9 items-center justify-center rounded-lg bg-[#efe6d6]/70 text-sm font-medium text-[#8a8174] tabular-nums"
              >
                {item.number}
              </span>
            ) : (
              <Link
                href={item.href}
                aria-current={item.state === "current" ? "step" : undefined}
                title={`Lecture ${item.number}: ${item.title}. ${stateLabel[item.state]}.`}
                className={`flex h-9 items-center justify-center rounded-lg text-sm font-medium tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e6b66] ${
                  item.state === "done"
                    ? "bg-[#0e6b66] text-[#f6f3ea]"
                    : item.state === "current"
                      ? "bg-[#fffaf3] text-[#0a3f3d] ring-2 ring-[#0e6b66]"
                      : "bg-[#efe6d6] text-[#5e564a]"
                }`}
              >
                {item.number}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-muted-foreground">
        Filled is done. The ring is the current step. Pale numbers are later. Locked steps stay
        closed until you finish the one before them.
      </p>
    </section>
  );
}
