"use client";

import { useCallback, useEffect, useState } from "react";
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

type EpisodeRow = {
  id: string;
  number: number;
  title: string;
  youtubeId: string | null;
  externalUrl: string | null;
};

type GroupDetail = {
  id: string;
  title: string;
  category: string;
  coverImage: string | null;
  isCourse: boolean;
  playlistUrl: string | null;
  shareToken: string | null;
  goals: { body: string }[];
  episodes: EpisodeRow[];
};

export function LibraryManagePanel({
  groups: initialGroups,
  initialGroupId,
}: {
  groups: GroupSummary[];
  initialGroupId?: string;
}) {
  const router = useRouter();
  const [groups, setGroups] = useState(initialGroups);
  const [mode, setMode] = useState<"list" | "new" | "edit">(
    initialGroupId ? "edit" : "list",
  );
  const [selectedId, setSelectedId] = useState(
    initialGroupId && initialGroups.some((g) => g.id === initialGroupId)
      ? initialGroupId
      : "",
  );
  const [detail, setDetail] = useState<GroupDetail | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<LibraryCategory>("ENGLISH");
  const [editIsCourse, setEditIsCourse] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [goalsText, setGoalsText] = useState("");
  const [episodePaste, setEpisodePaste] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<LibraryCategory>("ENGLISH");
  const [newIsCourse, setNewIsCourse] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState("");

  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const flash = (ok: string | null, err: string | null = null) => {
    setMessage(ok);
    setError(err);
  };

  const refreshGroups = useCallback(async () => {
    const response = await fetch("/api/library");
    if (!response.ok) return;
    const data = (await response.json()) as { groups: GroupSummary[] };
    setGroups(data.groups);
    router.refresh();
  }, [router]);

  const loadDetail = useCallback(async (groupId: string) => {
    const response = await fetch(`/api/library/groups/${groupId}`);
    if (!response.ok) {
      flash(null, "Could not load this group.");
      return;
    }
    const data = (await response.json()) as GroupDetail;
    setDetail(data);
    setEditTitle(data.title);
    setEditCategory(data.category as LibraryCategory);
    setEditIsCourse(data.isCourse);
    setPlaylistUrl(data.playlistUrl ?? "");
    setGoalsText(data.goals.map((g) => g.body).join("\n"));
    setShareUrl(
      data.shareToken ? `${window.location.origin}/share/${data.shareToken}` : null,
    );
  }, []);

  useEffect(() => {
    if (mode === "edit" && selectedId) void loadDetail(selectedId);
  }, [mode, selectedId, loadDetail]);

  function openEdit(id: string) {
    setSelectedId(id);
    setMode("edit");
    setMessage(null);
    setError(null);
  }

  async function createGroup() {
    if (!newTitle.trim()) return;
    setPending(true);
    flash(null);
    const response = await fetch("/api/library", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        category: newCategory,
        isCourse: newIsCourse,
        playlistUrl: newPlaylist.trim() || null,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      id?: string;
      error?: string;
    };
    if (!response.ok || !data.id) {
      setPending(false);
      flash(null, data.error ?? "Could not create group.");
      return;
    }

    let importNote = "";
    if (newPlaylist.trim()) {
      const imported = await fetch(`/api/library/groups/${data.id}/import-playlist`, {
        method: "POST",
      });
      if (imported.ok) importNote = " Episodes imported.";
    }

    setPending(false);
    setNewTitle("");
    setNewPlaylist("");
    setNewIsCourse(false);
    await refreshGroups();
    openEdit(data.id);
    flash(`Group created.${importNote}`);
  }

  async function saveGroup() {
    if (!selectedId || !editTitle.trim()) return;
    setPending(true);
    flash(null);
    const response = await fetch(`/api/library/groups/${selectedId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: editTitle.trim(),
        category: editCategory,
        isCourse: editIsCourse,
        playlistUrl: playlistUrl.trim() || null,
      }),
    });
    setPending(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      flash(null, data.error ?? "Could not save.");
      return;
    }
    await refreshGroups();
    await loadDetail(selectedId);
    flash("Saved.");
  }

  async function importPlaylist() {
    if (!selectedId || !playlistUrl.trim()) return;
    setPending(true);
    flash(null);
    await fetch(`/api/library/groups/${selectedId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ playlistUrl: playlistUrl.trim() }),
    });
    const response = await fetch(`/api/library/groups/${selectedId}/import-playlist`, {
      method: "POST",
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      flash(null, data.error ?? "Import failed.");
      return;
    }
    await refreshGroups();
    await loadDetail(selectedId);
    flash("Playlist imported.");
  }

  async function addEpisode() {
    if (!selectedId || !episodePaste.trim()) return;
    setPending(true);
    flash(null);
    const response = await fetch(`/api/library/groups/${selectedId}/episodes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ youtubeUrl: episodePaste.trim() }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      flash(null, data.error ?? "Could not add episode.");
      return;
    }
    setEpisodePaste("");
    await refreshGroups();
    await loadDetail(selectedId);
    flash("Episode added.");
  }

  async function deleteEpisode(episodeId: string, title: string) {
    if (!selectedId) return;
    if (!confirm(`Delete “${title}”?`)) return;
    setPending(true);
    flash(null);
    const response = await fetch(
      `/api/library/groups/${selectedId}/episodes/${episodeId}`,
      { method: "DELETE" },
    );
    setPending(false);
    if (!response.ok) {
      flash(null, "Could not delete episode.");
      return;
    }
    await refreshGroups();
    await loadDetail(selectedId);
    flash("Episode deleted.");
  }

  async function saveGoals() {
    if (!selectedId) return;
    setPending(true);
    flash(null);
    const goals = goalsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const response = await fetch(`/api/library/groups/${selectedId}/goals`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ goals }),
    });
    setPending(false);
    if (!response.ok) {
      flash(null, "Could not save goals.");
      return;
    }
    flash("Goals saved.");
  }

  async function shareGroup() {
    if (!selectedId) return;
    setPending(true);
    flash(null);
    const response = await fetch(`/api/library/groups/${selectedId}/share`, {
      method: "POST",
    });
    const data = (await response.json().catch(() => ({}))) as {
      shareToken?: string;
      error?: string;
    };
    setPending(false);
    if (!response.ok || !data.shareToken) {
      flash(null, data.error ?? "Could not share.");
      return;
    }
    const url = `${window.location.origin}/share/${data.shareToken}`;
    setShareUrl(url);
    try {
      await navigator.clipboard.writeText(url);
      flash("Share link copied.");
    } catch {
      flash("Share link ready — copy it below.");
    }
  }

  async function deleteGroup() {
    if (!selectedId || !detail) return;
    if (!confirm(`Delete the whole group “${detail.title}”? This cannot be undone.`)) {
      return;
    }
    setPending(true);
    flash(null);
    const response = await fetch(`/api/library/groups/${selectedId}`, {
      method: "DELETE",
    });
    setPending(false);
    if (!response.ok) {
      flash(null, "Could not delete group.");
      return;
    }
    setSelectedId("");
    setDetail(null);
    setMode("list");
    await refreshGroups();
    flash("Group deleted.");
  }

  return (
    <div className="flex flex-col gap-4">
      {(message || error) && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            error
              ? "bg-[#9c4a32]/10 text-[#9c4a32]"
              : "bg-[#0e6b66]/10 text-[#0a3f3d]"
          }`}
        >
          {error ?? message}
        </div>
      )}

      {mode === "list" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Tap a group to edit, or create a new one.
            </p>
            <Button
              onClick={() => {
                setMode("new");
                flash(null);
              }}
            >
              + New group
            </Button>
          </div>

          {groups.length === 0 ? (
            <p className="rounded-2xl bg-card p-6 text-sm text-muted-foreground ring-1 ring-foreground/10">
              No groups yet.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
              {groups.map((group) => (
                <li key={group.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-secondary/60"
                    onClick={() => openEdit(group.id)}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#0a3f3d]">{group.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {CATEGORY_LABELS[group.category as LibraryCategory] ?? group.category}
                        {" · "}
                        {group.episodeCount} episodes
                        {group.isCourse ? " · course" : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm text-[#0e6b66]">Edit →</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/library"
            className="text-sm text-[#0e6b66] underline-offset-2 hover:underline"
          >
            ← Back to library
          </Link>
        </div>
      ) : null}

      {mode === "new" ? (
        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#0a3f3d]">New group</h2>
            <Button
              variant="outline"
              onClick={() => {
                setMode("list");
                flash(null);
              }}
            >
              Cancel
            </Button>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <div>
              <Label htmlFor="new-title">Name</Label>
              <Input
                id="new-title"
                className="mt-1"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. German listening"
                autoFocus
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="new-category">Category</Label>
                <select
                  id="new-category"
                  className="mt-1 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as LibraryCategory)}
                >
                  {LIBRARY_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {CATEGORY_LABELS[item]}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={newIsCourse}
                  onChange={(e) => setNewIsCourse(e.target.checked)}
                />
                Course (lock until start)
              </label>
            </div>
            <div>
              <Label htmlFor="new-playlist">YouTube playlist (optional)</Label>
              <Input
                id="new-playlist"
                className="mt-1"
                value={newPlaylist}
                onChange={(e) => setNewPlaylist(e.target.value)}
                placeholder="Paste playlist link — episodes import automatically"
              />
            </div>
            <Button
              disabled={pending || !newTitle.trim()}
              onClick={() => void createGroup()}
            >
              {pending ? "Creating…" : "Create"}
            </Button>
          </div>
        </section>
      ) : null}

      {mode === "edit" && detail ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setMode("list");
                setDetail(null);
                flash(null);
              }}
            >
              ← All groups
            </Button>
            <Link
              href={`/library/g/${detail.id}`}
              className="rounded-lg px-3 py-2 text-sm text-[#0e6b66] ring-1 ring-foreground/10 hover:bg-secondary"
            >
              Open desk
            </Link>
          </div>

          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <h2 className="text-lg font-semibold text-[#0a3f3d]">Edit group</h2>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <Label htmlFor="edit-title">Name</Label>
                <Input
                  id="edit-title"
                  className="mt-1"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <select
                    id="edit-category"
                    className="mt-1 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as LibraryCategory)}
                  >
                    {LIBRARY_CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {CATEGORY_LABELS[item]}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-end gap-2 pb-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editIsCourse}
                    onChange={(e) => setEditIsCourse(e.target.checked)}
                  />
                  Course (lock until start)
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button disabled={pending} onClick={() => void saveGroup()}>
                  {pending ? "Saving…" : "Save"}
                </Button>
                <Button variant="outline" disabled={pending} onClick={() => void shareGroup()}>
                  Copy share link
                </Button>
                <Button
                  variant="outline"
                  className="border-[#9c4a32]/40 text-[#9c4a32]"
                  disabled={pending}
                  onClick={() => void deleteGroup()}
                >
                  Delete group
                </Button>
              </div>
              {shareUrl ? (
                <p className="break-all text-xs text-muted-foreground">{shareUrl}</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <h2 className="text-lg font-semibold text-[#0a3f3d]">Add videos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste a playlist to fill many episodes, or paste one YouTube link.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                placeholder="YouTube playlist URL"
                className="flex-1"
              />
              <Button
                variant="secondary"
                disabled={pending || !playlistUrl.trim()}
                onClick={() => void importPlaylist()}
              >
                Import playlist
              </Button>
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                value={episodePaste}
                onChange={(e) => setEpisodePaste(e.target.value)}
                placeholder="One video: youtu.be/… or youtube.com/watch?v=…"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void addEpisode();
                  }
                }}
              />
              <Button
                disabled={pending || !episodePaste.trim()}
                onClick={() => void addEpisode()}
              >
                Add episode
              </Button>
            </div>
          </section>

          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#0a3f3d]">Episodes</h2>
              <p className="text-xs text-muted-foreground">
                {detail.episodes.length} total
              </p>
            </div>
            {detail.episodes.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No episodes yet — import a playlist or add a link above.
              </p>
            ) : (
              <ul className="mt-3 max-h-[28rem] divide-y divide-border overflow-y-auto">
                {detail.episodes.map((episode) => (
                  <li
                    key={episode.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#0a3f3d]">
                        {episode.number}. {episode.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {episode.youtubeId
                          ? `YouTube · ${episode.youtubeId}`
                          : episode.externalUrl
                            ? "External link"
                            : "No video"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="shrink-0 border-[#9c4a32]/30 text-[#9c4a32]"
                      disabled={pending}
                      onClick={() => void deleteEpisode(episode.id, episode.title)}
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <h2 className="text-lg font-semibold text-[#0a3f3d]">Goals</h2>
            <p className="mt-1 text-sm text-muted-foreground">One goal per line.</p>
            <Textarea
              className="mt-3 min-h-28"
              value={goalsText}
              onChange={(e) => setGoalsText(e.target.value)}
              placeholder={"Finish unit 1\nPractice speaking twice a week"}
            />
            <Button
              className="mt-3"
              variant="secondary"
              disabled={pending}
              onClick={() => void saveGoals()}
            >
              Save goals
            </Button>
          </section>
        </div>
      ) : null}

      {mode === "edit" && !detail ? (
        <p className="text-sm text-muted-foreground">Loading group…</p>
      ) : null}
    </div>
  );
}
