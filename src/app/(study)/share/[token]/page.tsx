import { redirect } from "next/navigation";
import { ShareImportButton } from "@/components/share-import-button";
import { ApiError } from "@/lib/auth";
import { previewShare } from "@/lib/library";
import { CATEGORY_LABELS, type LibraryCategory } from "@/lib/library-categories";
import { getSession } from "@/lib/session";

export const metadata = { title: "Shared group" };

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const session = await getSession();
  if (!session) {
    const { token } = await params;
    redirect(`/login?next=${encodeURIComponent(`/share/${token}`)}`);
  }
  if (session.role !== "LEARNER") redirect("/dashboard");

  const { token } = await params;
  let preview;
  try {
    preview = await previewShare(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <div className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
          <p className="font-medium text-[#9c4a32]">Share link not found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            The owner may have disabled sharing.
          </p>
        </div>
      );
    }
    throw error;
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <header>
        <p className="text-sm text-muted-foreground">
          Shared by {preview.ownerName} ·{" "}
          {CATEGORY_LABELS[preview.category as LibraryCategory] ?? preview.category}
        </p>
        <h1 className="mt-1 text-3xl tracking-tight text-[#0a3f3d]">{preview.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {preview.episodeCount} episodes
          {preview.isCourse ? " · course (you will start it yourself)" : " · open playlist"}
        </p>
      </header>

      {preview.episodeTitles.length > 0 ? (
        <ul className="rounded-2xl bg-card p-5 text-sm ring-1 ring-foreground/10">
          {preview.episodeTitles.map((title) => (
            <li key={title} className="border-b border-border py-2 last:border-0">
              {title}
            </li>
          ))}
          {preview.episodeCount > preview.episodeTitles.length ? (
            <li className="pt-2 text-muted-foreground">…and more</li>
          ) : null}
        </ul>
      ) : null}

      <ShareImportButton token={token} />
      <p className="text-xs text-muted-foreground">
        Copying creates your own editable group. Progress and goals are not shared.
      </p>
    </div>
  );
}
