import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProgressToggle } from "@/components/progress-toggle";
import { YoutubePlayer } from "@/components/youtube-player";
import { ApiError } from "@/lib/auth";
import { getEpisodeDetail } from "@/lib/library";
import { getSession } from "@/lib/session";

export const metadata = { title: "Episode" };

export default async function LibraryEpisodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "LEARNER") redirect("/dashboard");

  const { id } = await params;
  let episode;
  try {
    episode = await getEpisodeDetail(session, id);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) notFound();
      if (error.status === 403) {
        const groupId = (error as ApiError & { groupId?: string }).groupId;
        return (
          <div className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
            <p className="font-medium text-[#9c4a32]">Episode locked</p>
            <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
            <Link
              href={groupId ? `/library/g/${groupId}` : "/library"}
              className="mt-4 inline-block text-sm text-[#0e6b66]"
            >
              Back to group
            </Link>
          </div>
        );
      }
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm text-muted-foreground">
          <Link href={`/library/g/${episode.group.id}`} className="hover:underline">
            {episode.group.title}
          </Link>
        </p>
        <h1 className="mt-1 text-3xl tracking-tight text-[#0a3f3d]">
          {episode.number}. {episode.title}
        </h1>
        {episode.summary ? (
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground line-clamp-3">
            {episode.summary}
          </p>
        ) : null}
      </header>

      {episode.youtubeId ? (
        <YoutubePlayer
          lectureId={episode.id}
          youtubeId={episode.youtubeId}
          title={episode.title}
          startSeconds={episode.positionSeconds}
          playbackPath={`/api/library/episodes/${episode.id}/playback`}
        />
      ) : episode.externalUrl ? (
        <div className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
          <p className="text-sm text-muted-foreground">
            Official / public source — opens on their site (no third-party “free movie”
            players, so you avoid pop-up and 18+ ads).
          </p>
          <a
            href={episode.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-lg bg-[#0e6b66] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a3f3d]"
          >
            Open official page
          </a>
          <p className="mt-3 break-all text-xs text-muted-foreground">{episode.externalUrl}</p>
        </div>
      ) : (
        <p className="rounded-2xl bg-card p-5 text-sm text-muted-foreground ring-1 ring-foreground/10">
          No video link on this episode.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <ProgressToggle
          targetType="library_episode"
          targetId={episode.id}
          action="watched"
          done={episode.status === "watched" || episode.status === "completed"}
          label="Mark watched"
          doneLabel="Watched"
        />
        <Link
          href={`/library/g/${episode.group.id}`}
          className="rounded-lg px-3 py-2 text-sm text-[#0e6b66] ring-1 ring-foreground/10 hover:bg-secondary"
        >
          Back to group
        </Link>
      </div>
    </div>
  );
}
