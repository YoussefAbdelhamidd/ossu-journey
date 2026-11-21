"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORY_LABELS,
  LIBRARY_CATEGORIES,
  type LibraryCategory,
} from "@/lib/library-categories";

type GroupSummary = {
  id: string;
  title: string;
  category: string;
  coverImage: string | null;
  isCourse: boolean;
  playlistUrl: string | null;
  startedAt: string | null;
  shareToken: string | null;
  episodeCount: number;
  goalCount: number;
};

type MixRow = { category: string; percent: number };

export function LibraryManagePanel({
  groups: initialGroups,
  mix: initialMix,
}: {
  groups: GroupSummary[];
  mix: MixRow[];
}) {
  const router = useRouter();
  const [groups, setGroups] = useState(initialGroups);
  const [selectedId, setSelectedId] = useState(initialGroups[0]?.id ?? "");
  const selected = groups.find((g) => g.id === selectedId) ?? null;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<LibraryCategory>("ENGLISH");
  const [isCourse, setIsCourse] = useState(true);
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [episodeUrl, setEpisodeUrl] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [goalsText, setGoalsText] = useState("");
  const [mix, setMix] = useState(initialMix);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const mixTotal = useMemo(
    () => mix.reduce((sum, row) => sum + Number(row.percent || 0), 0),
    [mix],
  );

  useEffect(() => {
    if (selectedId) void loadGoals(selectedId);
    // Initial load only for the first selected group.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    const response = await fetch("/api/library");
    if (!response.ok) return;
    const data = (await response.json()) as {
      groups: GroupSummary[];
      mix: MixRow[];
    };
    setGroups(data.groups);
    setMix(data.mix);
    router.refresh();
  }

  async function loadGoals(groupId: string) {
    const response = await fetch(`/api/library/groups/${groupId}`);
    if (!response.ok) return;
    const data = (await response.json()) as {
      goals: { body: string }[];
      playlistUrl: string | null;
      coverImage: string | null;
      shareToken: string | null;
    };
    setGoalsText(data.goals.map((g) => g.body).join("\n"));
    setPlaylistUrl(data.playlistUrl ?? "");
    setCoverImage(data.coverImage ?? "");
    setShareUrl(
      data.shareToken ? `${window.location.origin}/share/${data.shareToken}` : null,
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <aside className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
        <p className="text-xs tracking-[0.14em] text-[#0e6b66] uppercase">Your groups</p>
        <ul className="mt-3 space-y-1">
          {groups.map((group) => (
            <li key={group.id}>
              <button
                type="button"
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  selectedId === group.id
                    ? "bg-[#0e6b66] text-white"
                    : "hover:bg-secondary"
                }`}
                onClick={() => {
                  setSelectedId(group.id);
                  void loadGoals(group.id);
                }}
              >
                <span className="block font-medium">{group.title}</span>
                <span className="block text-xs opacity-80">
                  {CATEGORY_LABELS[group.category as LibraryCategory] ?? group.category} ·{" "}
                  {group.episodeCount} eps
                </span>
              </button>
            </li>
          ))}
        </ul>
        <Link
          href="/library"
          className="mt-4 inline-block text-sm text-[#0e6b66] underline-offset-2 hover:underline"
        >
          Back to library
        </Link>
      </aside>

      <div className="flex flex-col gap-6">
        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <h2 className="text-lg font-semibold text-[#0a3f3d]">Create group</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="new-title">Name</Label>
              <Input
                id="new-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="new-category">Category</Label>
              <select
                id="new-category"
                className="mt-1 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value as LibraryCategory)}
              >
                {LIBRARY_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {CATEGORY_LABELS[item]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2 pb-2">
              <input
                id="new-course"
                type="checkbox"
                checked={isCourse}
                onChange={(e) => setIsCourse(e.target.checked)}
              />
              <Label htmlFor="new-course">This is a course (locked until start)</Label>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="new-playlist">YouTube playlist URL (optional)</Label>
              <Input
                id="new-playlist"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                className="mt-1"
                placeholder="https://www.youtube.com/playlist?list=…"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="new-cover">Cover image URL (optional)</Label>
              <Input
                id="new-cover"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <Button
            className="mt-4"
            disabled={pending || !title.trim()}
            onClick={async () => {
              setPending(true);
              setError(null);
              setMessage(null);
              const response = await fetch("/api/library", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  title: title.trim(),
                  category,
                  isCourse,
                  playlistUrl: playlistUrl.trim() || null,
                  coverImage: coverImage.trim() || null,
                }),
              });
              const data = (await response.json().catch(() => ({}))) as {
                error?: string;
                id?: string;
              };
              setPending(false);
              if (!response.ok) {
                setError(data.error ?? "Could not create group.");
                return;
              }
              setTitle("");
              setMessage("Group created.");
              await refresh();
              if (data.id) {
                setSelectedId(data.id);
                await loadGoals(data.id);
              }
            }}
          >
            Create
          </Button>
        </section>

        {selected ? (
          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#0a3f3d]">{selected.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_LABELS[selected.category as LibraryCategory] ?? selected.category}
                  {selected.isCourse ? " · course" : " · open playlist"}
                </p>
              </div>
              <Link
                href={`/library/g/${selected.id}`}
                className="text-sm text-[#0e6b66] underline-offset-2 hover:underline"
              >
                Open desk
              </Link>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Playlist URL</Label>
                <Input
                  className="mt-1"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Cover image URL</Label>
                <Input
                  className="mt-1"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={pending}
                onClick={async () => {
                  setPending(true);
                  setError(null);
                  const response = await fetch(`/api/library/groups/${selected.id}`, {
                    method: "PATCH",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                      playlistUrl: playlistUrl.trim() || null,
                      coverImage: coverImage.trim() || null,
                    }),
                  });
                  setPending(false);
                  if (!response.ok) {
                    const data = (await response.json().catch(() => ({}))) as {
                      error?: string;
                    };
                    setError(data.error ?? "Could not save.");
                    return;
                  }
                  setMessage("Group saved.");
                  await refresh();
                }}
              >
                Save details
              </Button>
              <Button
                variant="outline"
                disabled={pending || !playlistUrl.trim()}
                onClick={async () => {
                  setPending(true);
                  setError(null);
                  await fetch(`/api/library/groups/${selected.id}`, {
                    method: "PATCH",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ playlistUrl: playlistUrl.trim() }),
                  });
                  const response = await fetch(
                    `/api/library/groups/${selected.id}/import-playlist`,
                    { method: "POST" },
                  );
                  const data = (await response.json().catch(() => ({}))) as {
                    error?: string;
                  };
                  setPending(false);
                  if (!response.ok) {
                    setError(data.error ?? "Import failed.");
                    return;
                  }
                  setMessage("Playlist imported.");
                  await refresh();
                }}
              >
                Import playlist episodes
              </Button>
              <Button
                variant="outline"
                disabled={pending}
                onClick={async () => {
                  setPending(true);
                  const response = await fetch(`/api/library/groups/${selected.id}/share`, {
                    method: "POST",
                  });
                  const data = (await response.json().catch(() => ({}))) as {
                    shareToken?: string;
                    error?: string;
                  };
                  setPending(false);
                  if (!response.ok || !data.shareToken) {
                    setError(data.error ?? "Could not share.");
                    return;
                  }
                  const url = `${window.location.origin}/share/${data.shareToken}`;
                  setShareUrl(url);
                  setMessage("Share link ready — friends can copy this group.");
                  await refresh();
                }}
              >
                Share / copy link
              </Button>
              <Button
                variant="outline"
                disabled={pending}
                onClick={async () => {
                  if (!confirm(`Delete “${selected.title}”?`)) return;
                  setPending(true);
                  await fetch(`/api/library/groups/${selected.id}`, { method: "DELETE" });
                  setPending(false);
                  setSelectedId("");
                  setMessage("Group deleted.");
                  await refresh();
                }}
              >
                Delete group
              </Button>
            </div>
            {shareUrl ? (
              <p className="mt-3 break-all text-xs text-muted-foreground">{shareUrl}</p>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <div>
                <Label>Add episode (YouTube URL)</Label>
                <Input
                  className="mt-1"
                  value={episodeUrl}
                  onChange={(e) => setEpisodeUrl(e.target.value)}
                  placeholder="https://youtu.be/…"
                />
              </div>
              <div>
                <Label>Title (optional)</Label>
                <Input
                  className="mt-1"
                  value={episodeTitle}
                  onChange={(e) => setEpisodeTitle(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  disabled={pending || !episodeUrl.trim()}
                  onClick={async () => {
                    setPending(true);
                    setError(null);
                    const response = await fetch(
                      `/api/library/groups/${selected.id}/episodes`,
                      {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({
                          youtubeUrl: episodeUrl.trim(),
                          title: episodeTitle.trim() || undefined,
                        }),
                      },
                    );
                    const data = (await response.json().catch(() => ({}))) as {
                      error?: string;
                    };
                    setPending(false);
                    if (!response.ok) {
                      setError(data.error ?? "Could not add episode.");
                      return;
                    }
                    setEpisodeUrl("");
                    setEpisodeTitle("");
                    setMessage("Episode added.");
                    await refresh();
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="goals">Goals (one per line)</Label>
              <Textarea
                id="goals"
                className="mt-1 min-h-28"
                value={goalsText}
                onChange={(e) => setGoalsText(e.target.value)}
                placeholder={"Finish A1 greetings\nPractice 10 minutes daily"}
              />
              <Button
                className="mt-3"
                variant="secondary"
                disabled={pending}
                onClick={async () => {
                  setPending(true);
                  setError(null);
                  const goals = goalsText
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean);
                  const response = await fetch(`/api/library/groups/${selected.id}/goals`, {
                    method: "PUT",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ goals }),
                  });
                  const data = (await response.json().catch(() => ({}))) as {
                    error?: string;
                  };
                  setPending(false);
                  if (!response.ok) {
                    setError(data.error ?? "Could not save goals.");
                    return;
                  }
                  setMessage("Goals saved.");
                  await refresh();
                }}
              >
                Save goals
              </Button>
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <h2 className="text-lg font-semibold text-[#0a3f3d]">Content mix targets</h2>
          <p className="mt-1 text-sm text-muted-foreground">Must add up to 100%.</p>
          <ul className="mt-4 space-y-3">
            {LIBRARY_CATEGORIES.map((cat) => {
              const row = mix.find((item) => item.category === cat);
              return (
                <li key={cat} className="flex items-center gap-3">
                  <Label className="w-36">{CATEGORY_LABELS[cat]}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-24"
                    value={row?.percent ?? 0}
                    onChange={(e) => {
                      const percent = Number(e.target.value);
                      setMix((prev) =>
                        prev.map((item) =>
                          item.category === cat ? { ...item, percent } : item,
                        ),
                      );
                    }}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-sm tabular-nums text-muted-foreground">Total {mixTotal}%</p>
          <Button
            className="mt-3"
            disabled={pending || mixTotal !== 100}
            onClick={async () => {
              setPending(true);
              setError(null);
              const response = await fetch("/api/library/mix", {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ mix }),
              });
              const data = (await response.json().catch(() => ({}))) as { error?: string };
              setPending(false);
              if (!response.ok) {
                setError(data.error ?? "Could not save mix.");
                return;
              }
              setMessage("Mix saved.");
              await refresh();
            }}
          >
            Save mix
          </Button>
        </section>

        {message ? <p className="text-sm text-[#0e6b66]">{message}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
