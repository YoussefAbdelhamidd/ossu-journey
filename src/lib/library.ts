import { randomBytes } from "node:crypto";
import { prisma } from "./db";
import { ApiError } from "./auth";
import type { SessionUser } from "./token";
import {
  DEFAULT_CONTENT_MIX,
  LIBRARY_CATEGORIES,
  type LibraryCategory,
  mixSum,
} from "./library-categories";
import {
  fetchPlaylistItems,
  parseYoutubePlaylistId,
  parseYoutubeVideoId,
  playlistUrlFromId,
  thumbnailUrl,
} from "./youtube";

function requireLearner(user: SessionUser) {
  if (user.role !== "LEARNER") {
    throw new ApiError(403, "Only learners manage a personal library.");
  }
}

async function getOwnedGroup(userId: string, groupId: string) {
  const group = await prisma.libraryGroup.findUnique({
    where: { id: groupId },
    include: {
      episodes: { orderBy: { order: "asc" } },
      goals: { orderBy: { order: "asc" } },
    },
  });
  if (!group) throw new ApiError(404, "Group not found.");
  if (group.ownerId !== userId) throw new ApiError(403, "You can only edit your own groups.");
  return group;
}

export function episodeUnlocked(
  group: { isCourse: boolean; startedAt: Date | null },
  episodeIndex: number,
  progress: { targetType: string; targetId: string; status: string }[],
  episodes: { id: string }[],
): { unlocked: boolean; lockedByTitle: string | null } {
  if (!group.isCourse) return { unlocked: true, lockedByTitle: null };
  if (!group.startedAt) return { unlocked: false, lockedByTitle: null };
  if (episodeIndex <= 0) return { unlocked: true, lockedByTitle: null };

  const previous = episodes[episodeIndex - 1];
  if (!previous) return { unlocked: true, lockedByTitle: null };
  const done = progress.some(
    (row) =>
      row.targetType === "library_episode" &&
      row.targetId === previous.id &&
      (row.status === "watched" || row.status === "completed"),
  );
  if (done) return { unlocked: true, lockedByTitle: null };
  return { unlocked: false, lockedByTitle: "the previous episode" };
}

export async function listLibrary(user: SessionUser) {
  requireLearner(user);
  const [groups, mixRows, progress] = await Promise.all([
    prisma.libraryGroup.findMany({
      where: { ownerId: user.id },
      orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "asc" }],
      include: {
        _count: { select: { episodes: true, goals: true } },
      },
    }),
    prisma.userContentMix.findMany({ where: { userId: user.id } }),
    prisma.progress.findMany({
      where: {
        userId: user.id,
        targetType: { in: ["library_episode", "library_group"] },
      },
    }),
  ]);

  const mix =
    mixRows.length > 0
      ? LIBRARY_CATEGORIES.map((category) => ({
          category,
          percent: mixRows.find((row) => row.category === category)?.percent ?? 0,
        }))
      : LIBRARY_CATEGORIES.map((category) => ({
          category,
          percent: DEFAULT_CONTENT_MIX[category],
        }));

  const episodeIdsByCategory = new Map<string, string[]>();
  const episodeGroups = await prisma.libraryEpisode.findMany({
    where: { group: { ownerId: user.id } },
    select: { id: true, group: { select: { category: true } } },
  });
  for (const episode of episodeGroups) {
    const list = episodeIdsByCategory.get(episode.group.category) ?? [];
    list.push(episode.id);
    episodeIdsByCategory.set(episode.group.category, list);
  }

  const actual: Record<string, number> = {};
  let completedTotal = 0;
  for (const category of LIBRARY_CATEGORIES) {
    const ids = new Set(episodeIdsByCategory.get(category) ?? []);
    const completed = progress.filter(
      (row) =>
        row.targetType === "library_episode" &&
        ids.has(row.targetId) &&
        (row.status === "watched" || row.status === "completed"),
    ).length;
    actual[category] = completed;
    completedTotal += completed;
  }

  const actualMix = LIBRARY_CATEGORIES.map((category) => ({
    category,
    percent:
      completedTotal === 0
        ? 0
        : Math.round(((actual[category] ?? 0) / completedTotal) * 1000) / 10,
    completed: actual[category] ?? 0,
  }));

  return {
    groups: groups.map((group) => ({
      id: group.id,
      title: group.title,
      category: group.category,
      coverImage: group.coverImage,
      isCourse: group.isCourse,
      playlistUrl: group.playlistUrl,
      startedAt: group.startedAt?.toISOString() ?? null,
      shareToken: group.shareToken,
      order: group.order,
      episodeCount: group._count.episodes,
      goalCount: group._count.goals,
    })),
    mix,
    actualMix,
    completedTotal,
  };
}

export async function createGroup(
  user: SessionUser,
  input: {
    title: string;
    category: LibraryCategory;
    coverImage?: string | null;
    isCourse?: boolean;
    playlistUrl?: string | null;
  },
) {
  requireLearner(user);
  let playlistUrl = input.playlistUrl?.trim() || null;
  if (playlistUrl) {
    const id = parseYoutubePlaylistId(playlistUrl);
    if (!id) throw new ApiError(400, "Playlist URL was not understood.");
    playlistUrl = playlistUrlFromId(id);
  }

  const count = await prisma.libraryGroup.count({ where: { ownerId: user.id } });
  return prisma.libraryGroup.create({
    data: {
      ownerId: user.id,
      title: input.title,
      category: input.category,
      coverImage: input.coverImage ?? null,
      isCourse: input.isCourse ?? false,
      playlistUrl,
      order: count,
    },
  });
}

export async function updateGroup(
  user: SessionUser,
  groupId: string,
  input: {
    title?: string;
    category?: LibraryCategory;
    coverImage?: string | null;
    isCourse?: boolean;
    playlistUrl?: string | null;
    order?: number;
  },
) {
  requireLearner(user);
  await getOwnedGroup(user.id, groupId);

  let playlistUrl = input.playlistUrl;
  if (playlistUrl != null && playlistUrl.trim()) {
    const id = parseYoutubePlaylistId(playlistUrl);
    if (!id) throw new ApiError(400, "Playlist URL was not understood.");
    playlistUrl = playlistUrlFromId(id);
  } else if (playlistUrl != null) {
    playlistUrl = null;
  }

  return prisma.libraryGroup.update({
    where: { id: groupId },
    data: {
      ...(input.title != null ? { title: input.title } : {}),
      ...(input.category != null ? { category: input.category } : {}),
      ...(input.coverImage !== undefined ? { coverImage: input.coverImage } : {}),
      ...(input.isCourse != null ? { isCourse: input.isCourse } : {}),
      ...(playlistUrl !== undefined ? { playlistUrl } : {}),
      ...(input.order != null ? { order: input.order } : {}),
    },
  });
}

export async function deleteGroup(user: SessionUser, groupId: string) {
  requireLearner(user);
  await getOwnedGroup(user.id, groupId);
  await prisma.libraryGroup.delete({ where: { id: groupId } });
  return { ok: true };
}

export async function getGroupDetail(user: SessionUser, groupId: string) {
  requireLearner(user);
  const group = await prisma.libraryGroup.findUnique({
    where: { id: groupId },
    include: {
      episodes: { orderBy: { order: "asc" } },
      goals: { orderBy: { order: "asc" } },
      owner: { select: { id: true, name: true } },
    },
  });
  if (!group) throw new ApiError(404, "Group not found.");
  if (group.ownerId !== user.id) throw new ApiError(403, "This group is private.");

  const progress = await prisma.progress.findMany({
    where: {
      userId: user.id,
      OR: [
        { targetType: "library_group", targetId: group.id },
        {
          targetType: "library_episode",
          targetId: { in: group.episodes.map((e) => e.id) },
        },
      ],
    },
  });

  const episodes = group.episodes.map((episode, index) => {
    const lock = episodeUnlocked(group, index, progress, group.episodes);
    const row = progress.find(
      (item) => item.targetType === "library_episode" && item.targetId === episode.id,
    );
    return {
      id: episode.id,
      number: episode.number,
      title: episode.title,
      summary: episode.summary,
      youtubeId: episode.youtubeId,
      durationSeconds: episode.durationSeconds,
      order: episode.order,
      unlocked: lock.unlocked,
      lockedByTitle: lock.lockedByTitle,
      status: row?.status ?? null,
    };
  });

  return {
    id: group.id,
    title: group.title,
    category: group.category,
    coverImage: group.coverImage,
    isCourse: group.isCourse,
    playlistUrl: group.playlistUrl,
    startedAt: group.startedAt?.toISOString() ?? null,
    shareToken: group.shareToken,
    order: group.order,
    owner: group.owner,
    isOwner: true,
    goals: group.goals.map((goal) => ({
      id: goal.id,
      body: goal.body,
      order: goal.order,
    })),
    episodes,
    lockedUntilStart: group.isCourse && !group.startedAt,
  };
}

export async function startGroup(user: SessionUser, groupId: string) {
  requireLearner(user);
  const group = await getOwnedGroup(user.id, groupId);
  if (!group.isCourse) throw new ApiError(400, "Only courses need to be started.");
  if (group.startedAt) return group;
  return prisma.libraryGroup.update({
    where: { id: groupId },
    data: { startedAt: new Date() },
  });
}

export async function addEpisode(
  user: SessionUser,
  groupId: string,
  input: { title?: string; youtubeUrl: string; summary?: string | null },
) {
  requireLearner(user);
  const group = await getOwnedGroup(user.id, groupId);
  const youtubeId = parseYoutubeVideoId(input.youtubeUrl);
  if (!youtubeId) throw new ApiError(400, "YouTube video URL was not understood.");

  const nextNumber =
    group.episodes.reduce((max, episode) => Math.max(max, episode.number), 0) + 1;

  return prisma.libraryEpisode.create({
    data: {
      groupId,
      number: nextNumber,
      order: nextNumber - 1,
      title: input.title?.trim() || `Episode ${nextNumber}`,
      youtubeId,
      summary: input.summary ?? null,
    },
  });
}

export async function deleteEpisode(user: SessionUser, groupId: string, episodeId: string) {
  requireLearner(user);
  await getOwnedGroup(user.id, groupId);
  const episode = await prisma.libraryEpisode.findFirst({
    where: { id: episodeId, groupId },
  });
  if (!episode) throw new ApiError(404, "Episode not found.");
  await prisma.libraryEpisode.delete({ where: { id: episodeId } });
  return { ok: true };
}

export async function importPlaylist(user: SessionUser, groupId: string) {
  requireLearner(user);
  const group = await getOwnedGroup(user.id, groupId);
  if (!group.playlistUrl) {
    throw new ApiError(400, "Set a playlist URL on this group first.");
  }
  const playlistId = parseYoutubePlaylistId(group.playlistUrl);
  if (!playlistId) throw new ApiError(400, "Playlist URL was not understood.");

  let items;
  try {
    items = await fetchPlaylistItems(playlistId);
  } catch (error) {
    throw new ApiError(
      400,
      error instanceof Error ? error.message : "Could not import playlist.",
    );
  }
  if (items.length === 0) throw new ApiError(400, "Playlist had no public videos.");

  await prisma.$transaction(async (tx) => {
    await tx.libraryEpisode.deleteMany({ where: { groupId } });
    await tx.libraryEpisode.createMany({
      data: items.map((item, index) => ({
        groupId,
        number: index + 1,
        order: index,
        title: item.title,
        summary: item.summary,
        youtubeId: item.youtubeId,
        durationSeconds: item.durationSeconds,
      })),
    });
    if (!group.coverImage && items[0]?.youtubeId) {
      await tx.libraryGroup.update({
        where: { id: groupId },
        data: { coverImage: thumbnailUrl(items[0].youtubeId) },
      });
    }
  });

  return getGroupDetail(user, groupId);
}

export async function replaceGoals(user: SessionUser, groupId: string, goals: string[]) {
  requireLearner(user);
  await getOwnedGroup(user.id, groupId);
  await prisma.$transaction(async (tx) => {
    await tx.libraryGoal.deleteMany({ where: { groupId } });
    if (goals.length > 0) {
      await tx.libraryGoal.createMany({
        data: goals.map((body, order) => ({ groupId, body, order })),
      });
    }
  });
  return getGroupDetail(user, groupId);
}

export async function enableShare(user: SessionUser, groupId: string) {
  requireLearner(user);
  const group = await getOwnedGroup(user.id, groupId);
  if (group.shareToken) return { shareToken: group.shareToken };
  const shareToken = randomBytes(12).toString("hex");
  await prisma.libraryGroup.update({
    where: { id: groupId },
    data: { shareToken },
  });
  return { shareToken };
}

export async function disableShare(user: SessionUser, groupId: string) {
  requireLearner(user);
  await getOwnedGroup(user.id, groupId);
  await prisma.libraryGroup.update({
    where: { id: groupId },
    data: { shareToken: null },
  });
  return { ok: true };
}

export async function previewShare(token: string) {
  const group = await prisma.libraryGroup.findUnique({
    where: { shareToken: token },
    include: {
      episodes: { orderBy: { order: "asc" }, select: { title: true, number: true } },
      owner: { select: { name: true } },
      _count: { select: { episodes: true } },
    },
  });
  if (!group) throw new ApiError(404, "Share link not found.");
  return {
    title: group.title,
    category: group.category,
    coverImage: group.coverImage,
    isCourse: group.isCourse,
    ownerName: group.owner.name,
    episodeCount: group._count.episodes,
    episodeTitles: group.episodes.slice(0, 8).map((e) => e.title),
  };
}

export async function importSharedGroup(user: SessionUser, token: string) {
  requireLearner(user);
  const source = await prisma.libraryGroup.findUnique({
    where: { shareToken: token },
    include: {
      episodes: { orderBy: { order: "asc" } },
    },
  });
  if (!source) throw new ApiError(404, "Share link not found.");

  const count = await prisma.libraryGroup.count({ where: { ownerId: user.id } });
  const clone = await prisma.$transaction(async (tx) => {
    const group = await tx.libraryGroup.create({
      data: {
        ownerId: user.id,
        category: source.category,
        title: source.title,
        coverImage: source.coverImage,
        isCourse: source.isCourse,
        playlistUrl: source.playlistUrl,
        startedAt: null,
        shareToken: null,
        order: count,
      },
    });
    if (source.episodes.length > 0) {
      await tx.libraryEpisode.createMany({
        data: source.episodes.map((episode) => ({
          groupId: group.id,
          number: episode.number,
          title: episode.title,
          summary: episode.summary,
          youtubeId: episode.youtubeId,
          durationSeconds: episode.durationSeconds,
          order: episode.order,
        })),
      });
    }
    return group;
  });

  return { id: clone.id, title: clone.title };
}

export async function setContentMix(
  user: SessionUser,
  mix: { category: LibraryCategory; percent: number }[],
) {
  requireLearner(user);
  const byCategory = new Map(mix.map((row) => [row.category, row.percent]));
  const rows = LIBRARY_CATEGORIES.map((category) => ({
    category,
    percent: byCategory.get(category) ?? 0,
  }));
  if (mixSum(rows) !== 100) {
    throw new ApiError(400, "Category mix must add up to 100%.");
  }

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      await tx.userContentMix.upsert({
        where: {
          userId_category: { userId: user.id, category: row.category },
        },
        update: { percent: row.percent },
        create: {
          userId: user.id,
          category: row.category,
          percent: row.percent,
        },
      });
    }
  });

  return { mix: rows };
}

export async function getEpisodeDetail(user: SessionUser, episodeId: string) {
  requireLearner(user);
  const episode = await prisma.libraryEpisode.findUnique({
    where: { id: episodeId },
    include: {
      group: {
        include: {
          episodes: { orderBy: { order: "asc" } },
          goals: { orderBy: { order: "asc" } },
        },
      },
    },
  });
  if (!episode) throw new ApiError(404, "Episode not found.");
  if (episode.group.ownerId !== user.id) {
    throw new ApiError(403, "This episode is private.");
  }

  const progress = await prisma.progress.findMany({
    where: {
      userId: user.id,
      targetType: "library_episode",
      targetId: { in: episode.group.episodes.map((e) => e.id) },
    },
  });
  const index = episode.group.episodes.findIndex((e) => e.id === episodeId);
  const lock = episodeUnlocked(episode.group, index, progress, episode.group.episodes);
  if (!lock.unlocked) {
    const err = new ApiError(
      403,
      episode.group.isCourse && !episode.group.startedAt
        ? "Start this course before watching episodes."
        : `Finish ${lock.lockedByTitle} first.`,
    ) as ApiError & { groupId?: string };
    err.groupId = episode.group.id;
    throw err;
  }

  const [note, playback, progressRow] = await Promise.all([
    prisma.episodeNote.findUnique({
      where: { userId_episodeId: { userId: user.id, episodeId } },
    }),
    prisma.episodePlayback.findUnique({
      where: { userId_episodeId: { userId: user.id, episodeId } },
    }),
    prisma.progress.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType: "library_episode",
          targetId: episodeId,
        },
      },
    }),
  ]);

  return {
    id: episode.id,
    number: episode.number,
    title: episode.title,
    summary: episode.summary,
    youtubeId: episode.youtubeId,
    durationSeconds: episode.durationSeconds,
    status: progressRow?.status ?? null,
    note: note?.body ?? "",
    positionSeconds: playback?.positionSeconds ?? 0,
    goals: episode.group.goals.map((g) => g.body),
    group: {
      id: episode.group.id,
      title: episode.group.title,
      category: episode.group.category,
      isCourse: episode.group.isCourse,
      startedAt: episode.group.startedAt?.toISOString() ?? null,
    },
  };
}

export async function saveEpisodeNote(user: SessionUser, episodeId: string, body: string) {
  requireLearner(user);
  await getEpisodeDetail(user, episodeId);
  await prisma.episodeNote.upsert({
    where: { userId_episodeId: { userId: user.id, episodeId } },
    update: { body },
    create: { userId: user.id, episodeId, body },
  });
  return { ok: true };
}

export async function saveEpisodePlayback(
  user: SessionUser,
  episodeId: string,
  positionSeconds: number,
) {
  requireLearner(user);
  await getEpisodeDetail(user, episodeId);
  await prisma.episodePlayback.upsert({
    where: { userId_episodeId: { userId: user.id, episodeId } },
    update: { positionSeconds },
    create: { userId: user.id, episodeId, positionSeconds },
  });
  return { ok: true };
}

/** Seed helper: ensure default mix + language tracks for one learner. */
export async function ensureLearnerLibrary(userId: string) {
  for (const category of LIBRARY_CATEGORIES) {
    await prisma.userContentMix.upsert({
      where: { userId_category: { userId, category } },
      update: {},
      create: {
        userId,
        category,
        percent: DEFAULT_CONTENT_MIX[category],
      },
    });
  }
}
