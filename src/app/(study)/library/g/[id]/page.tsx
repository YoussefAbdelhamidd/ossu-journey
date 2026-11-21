import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { GoalsToast } from "@/components/goals-toast";
import { StartCourseButton } from "@/components/start-course-button";
import { Badge } from "@/components/ui/badge";
import { ProgressToggle } from "@/components/progress-toggle";
import { CATEGORY_LABELS, type LibraryCategory } from "@/lib/library-categories";
import { ApiError } from "@/lib/auth";
import { getGroupDetail } from "@/lib/library";
import { getSession } from "@/lib/session";

export const metadata = { title: "Group" };

export default async function LibraryGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "LEARNER") redirect("/dashboard");

  const { id } = await params;
  let group;
  try {
    group = await getGroupDetail(session, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      {group.isCourse ? (
        <GoalsToast groupId={group.id} goals={group.goals.map((g) => g.body)} />
      ) : null}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/library" className="hover:underline">
              Library
            </Link>
            {" · "}
            {CATEGORY_LABELS[group.category as LibraryCategory] ?? group.category}
          </p>
          <h1 className="mt-1 text-3xl tracking-tight text-[#0a3f3d]">{group.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.isCourse ? (
              <Badge className="bg-[#0e6b66] text-white">Course</Badge>
            ) : (
              <Badge variant="secondary">Open playlist</Badge>
            )}
            {group.lockedUntilStart ? (
              <Badge className="bg-[#9c4a32] text-white">Locked until start</Badge>
            ) : null}
          </div>
        </div>
        <Link
          href="/library/manage"
          className="text-sm text-[#0e6b66] underline-offset-2 hover:underline"
        >
          Edit in control panel
        </Link>
      </header>

      {group.goals.length > 0 ? (
        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <p className="text-xs tracking-[0.14em] text-[#0e6b66] uppercase">Goals</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#1e1a14]">
            {group.goals.map((goal) => (
              <li key={goal.id}>{goal.body}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {group.lockedUntilStart ? (
        <section className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
          <p className="font-medium text-[#9c4a32]">Course locked</p>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Episodes stay locked until you start. When you are ready, begin and work through
            them in order.
          </p>
          <div className="mt-4">
            <StartCourseButton groupId={group.id} />
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <p className="text-xs tracking-[0.14em] text-[#0e6b66] uppercase">Episodes</p>
        {group.episodes.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No episodes yet. Import a playlist or add YouTube links in the control panel.
          </p>
        ) : (
          <ol className="mt-4 divide-y divide-border">
            {group.episodes.map((episode) => {
              const locked = !episode.unlocked;
              return (
                <li
                  key={episode.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#0a3f3d]">
                      {episode.number}. {episode.title}
                    </p>
                    {locked && episode.lockedByTitle ? (
                      <p className="text-xs text-[#9c4a32]">
                        After {episode.lockedByTitle}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {locked ? (
                      <Badge className="bg-[#9c4a32] text-white">Locked</Badge>
                    ) : (
                      <>
                        <Link
                          href={`/library/e/${episode.id}`}
                          className="rounded-lg bg-[#0e6b66] px-3 py-1.5 text-sm text-white hover:bg-[#0a3f3d]"
                        >
                          Watch
                        </Link>
                        <ProgressToggle
                          targetType="library_episode"
                          targetId={episode.id}
                          action="watched"
                          done={episode.status === "watched" || episode.status === "completed"}
                          label="Mark watched"
                          doneLabel="Watched"
                          variant="outline"
                        />
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
