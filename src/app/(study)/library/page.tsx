import Link from "next/link";
import { redirect } from "next/navigation";
import { MixMeter } from "@/components/mix-meter";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, type LibraryCategory } from "@/lib/library-categories";
import { listLibrary } from "@/lib/library";
import { getSession } from "@/lib/session";

export const metadata = { title: "Library" };

export default async function LibraryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "LEARNER") redirect("/dashboard");

  const data = await listLibrary(session);
  const byCategory = new Map<string, typeof data.groups>();
  for (const group of data.groups) {
    const list = byCategory.get(group.category) ?? [];
    list.push(group);
    byCategory.set(group.category, list);
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Your tracks</p>
          <h1 className="mt-1 text-3xl tracking-tight text-[#0a3f3d] sm:text-4xl">
            Library
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            English, German, religion, and safe film/series sets. Programs (OSSU) stay on
            the Curriculum page. Entertainment uses official free sources only — no pirate
            streamers.
          </p>
        </div>
        <Link
          href="/library/manage"
          className="rounded-lg bg-[#0e6b66] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a3f3d]"
        >
          Control panel
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-8">
          {(["ENGLISH", "GERMAN", "RELIGION", "ENTERTAINMENT", "PROGRAMS"] as LibraryCategory[]).map(
            (category) => {
              const groups = byCategory.get(category) ?? [];
              return (
                <section key={category}>
                  <h2 className="text-lg font-semibold text-[#0a3f3d]">
                    {CATEGORY_LABELS[category]}
                  </h2>
                  {groups.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No groups yet. Add one in the control panel.
                    </p>
                  ) : (
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                      {groups.map((group) => (
                        <li key={group.id}>
                          <Link
                            href={`/library/g/${group.id}`}
                            className="flex gap-3 rounded-2xl bg-card p-3 ring-1 ring-foreground/10 hover:ring-[#0e6b66]/40"
                          >
                            <div
                              className="size-16 shrink-0 rounded-xl bg-[#efe4d2] bg-cover bg-center"
                              style={
                                group.coverImage
                                  ? { backgroundImage: `url(${group.coverImage})` }
                                  : undefined
                              }
                            />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[#0a3f3d]">
                                {group.title}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {group.episodeCount} episodes
                                {group.goalCount > 0 ? ` · ${group.goalCount} goals` : ""}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {group.isCourse ? (
                                  <Badge className="bg-[#0e6b66] text-white">Course</Badge>
                                ) : (
                                  <Badge variant="secondary">Open</Badge>
                                )}
                                {group.isCourse && !group.startedAt ? (
                                  <Badge className="bg-[#9c4a32] text-white">Not started</Badge>
                                ) : null}
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            },
          )}
        </div>
        <MixMeter actual={data.actualMix} completedTotal={data.completedTotal} />
      </div>
    </div>
  );
}
