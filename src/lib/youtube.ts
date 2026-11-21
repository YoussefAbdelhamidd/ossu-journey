const WATCH_RE =
  /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
const PLAYLIST_RE = /[?&]list=([A-Za-z0-9_-]+)/;

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export function parseYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(WATCH_RE);
  return match?.[1] ?? null;
}

export function parseYoutubePlaylistId(input: string): string | null {
  const trimmed = input.trim();
  if (/^PL[A-Za-z0-9_-]+$/.test(trimmed) || /^UU[A-Za-z0-9_-]+$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(PLAYLIST_RE);
  return match?.[1] ?? null;
}

export function playlistUrlFromId(playlistId: string): string {
  return `https://www.youtube.com/playlist?list=${playlistId}`;
}

export function thumbnailUrl(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

export type PlaylistItem = {
  youtubeId: string;
  title: string;
  summary: string | null;
  durationSeconds: number | null;
};

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

const INNERTUBE_CLIENT = {
  clientName: "WEB",
  clientVersion: "2.20260101.00.00",
  hl: "en",
  gl: "US",
};

function asRecord(value: Json | undefined): Record<string, Json> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value;
}

function textFromRuns(value: Json | undefined): string | null {
  const record = asRecord(value);
  if (!record) return null;
  if (typeof record.simpleText === "string" && record.simpleText.trim()) {
    return record.simpleText.trim();
  }
  if (typeof record.content === "string" && record.content.trim()) {
    return record.content.trim();
  }
  if (!Array.isArray(record.runs)) return null;
  const joined = record.runs
    .map((run) => {
      const row = asRecord(run);
      return row && typeof row.text === "string" ? row.text : "";
    })
    .join("")
    .trim();
  return joined || null;
}

function parseClockDuration(label: string | null): number | null {
  if (!label) return null;
  const cleaned = label.replace(/[^0-9:]/g, "");
  const parts = cleaned.split(":").map((part) => Number(part));
  if (parts.length === 0 || parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 3) return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
  if (parts.length === 2) return parts[0]! * 60 + parts[1]!;
  return parts[0] ?? null;
}

function pushItem(
  out: PlaylistItem[],
  seen: Set<string>,
  youtubeId: string | null,
  title: string | null,
  summary: string | null,
  durationSeconds: number | null,
) {
  if (!youtubeId || !title) return;
  if (title === "Private video" || title === "Deleted video") return;
  if (seen.has(youtubeId)) return;
  seen.add(youtubeId);
  out.push({ youtubeId, title, summary, durationSeconds });
}

function durationFromLockup(lockup: Record<string, Json>): number | null {
  const image = asRecord(lockup.contentImage);
  const thumb = asRecord(image?.thumbnailViewModel);
  const overlays = thumb?.overlays;
  if (!Array.isArray(overlays)) return null;
  for (const overlay of overlays) {
    const row = asRecord(overlay);
    const bottom = asRecord(row?.thumbnailBottomOverlayViewModel);
    const badges = bottom?.badges;
    if (!Array.isArray(badges)) continue;
    for (const badge of badges) {
      const badgeRow = asRecord(badge);
      const model = asRecord(badgeRow?.thumbnailBadgeViewModel);
      if (typeof model?.text === "string") {
        return parseClockDuration(model.text);
      }
    }
  }
  return null;
}

function collectPlaylistVideos(node: Json, out: PlaylistItem[], seen: Set<string>) {
  if (node == null) return;
  if (Array.isArray(node)) {
    for (const child of node) collectPlaylistVideos(child, out, seen);
    return;
  }
  if (typeof node !== "object") return;

  const classic = asRecord(node.playlistVideoRenderer) ?? asRecord(node.playlistPanelVideoRenderer);
  if (classic) {
    pushItem(
      out,
      seen,
      typeof classic.videoId === "string" ? classic.videoId : null,
      textFromRuns(classic.title),
      textFromRuns(classic.descriptionSnippet),
      parseClockDuration(textFromRuns(classic.lengthText)),
    );
  }

  const lockup = asRecord(node.lockupViewModel);
  if (lockup && lockup.contentType === "LOCKUP_CONTENT_TYPE_VIDEO") {
    const metadata = asRecord(lockup.metadata);
    const metaModel = asRecord(metadata?.lockupMetadataViewModel);
    const titleObj = asRecord(metaModel?.title);
    pushItem(
      out,
      seen,
      typeof lockup.contentId === "string" ? lockup.contentId : null,
      typeof titleObj?.content === "string" ? titleObj.content.trim() : null,
      null,
      durationFromLockup(lockup),
    );
  }

  for (const value of Object.values(node)) {
    collectPlaylistVideos(value as Json, out, seen);
  }
}

/** Prefer playlist continuation tokens, not menu / player ones. */
function findContinuation(node: Json): string | null {
  if (node == null) return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findContinuation(child);
      if (found) return found;
    }
    return null;
  }
  if (typeof node !== "object") return null;

  const item = asRecord(node.continuationItemRenderer);
  if (item) {
    const button = asRecord(item.button) ?? asRecord(item.continuationEndpoint);
    const endpoint =
      asRecord(button?.buttonRenderer)?.command ??
      asRecord(item.continuationEndpoint) ??
      asRecord(asRecord(button)?.continuationEndpoint);
    const command = asRecord(asRecord(endpoint)?.continuationCommand);
    if (typeof command?.token === "string" && command.token) return command.token;

    // Newer UI sometimes nests the endpoint differently.
    const nested = asRecord(item.continuationEndpoint);
    const nestedCommand = asRecord(nested?.continuationCommand);
    if (typeof nestedCommand?.token === "string") return nestedCommand.token;
  }

  for (const value of Object.values(node)) {
    const found = findContinuation(value as Json);
    if (found) return found;
  }
  return null;
}

async function innertubeBrowse(playlistId: string): Promise<PlaylistItem[]> {
  const items: PlaylistItem[] = [];
  const seen = new Set<string>();
  let continuation: string | null = null;
  let first = true;
  let pages = 0;

  while ((first || continuation) && pages < 40) {
    pages += 1;
    const body = first
      ? {
          context: { client: INNERTUBE_CLIENT },
          browseId: `VL${playlistId}`,
        }
      : {
          context: { client: INNERTUBE_CLIENT },
          continuation,
        };

    const response = await fetch(
      "https://www.youtube.com/youtubei/v1/browse?prettyPrint=false",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": BROWSER_UA,
          "x-youtube-client-name": "1",
          "x-youtube-client-version": INNERTUBE_CLIENT.clientVersion,
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error(`YouTube playlist request failed (${response.status}).`);
    }

    const before = items.length;
    const data = (await response.json()) as Json;
    collectPlaylistVideos(data, items, seen);
    continuation = findContinuation(data);
    first = false;

    if (items.length === before && !continuation) break;
    if (items.length > 2_000) break;
  }

  return items;
}

/**
 * Expand a public YouTube playlist into episode rows.
 * Uses YouTube’s public web endpoints — no Google Cloud API key.
 */
export async function fetchPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
  const items = await innertubeBrowse(playlistId);
  if (items.length > 0) return items;

  throw new Error(
    "Could not read that playlist. Check the link is public, then try again.",
  );
}
