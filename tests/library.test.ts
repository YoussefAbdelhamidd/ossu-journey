import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/token";
import { POST as login } from "@/app/api/auth/login/route";
import { GET as listLibrary, POST as createGroup } from "@/app/api/library/route";
import {
  GET as getGroup,
  PATCH as patchGroup,
} from "@/app/api/library/groups/[id]/route";
import { POST as startGroup } from "@/app/api/library/groups/[id]/start/route";
import { POST as enableShare } from "@/app/api/library/groups/[id]/share/route";
import { POST as importShare } from "@/app/api/library/import/[token]/route";
import { POST as addEpisode } from "@/app/api/library/groups/[id]/episodes/route";
import { POST as saveProgress } from "@/app/api/progress/route";
import { episodeUnlocked } from "@/lib/library";
import { learnerLibraryGroups } from "../prisma/seed-data/library-tracks";

const LEARNER_PASSWORD = "Vdlz1L4P5icHj4aQW-Lr";

async function signIn(email: string, password: string) {
  const response = await login(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  );
  const token = response.cookies.get(SESSION_COOKIE)?.value;
  return { response, token };
}

function authed(url: string, token: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set("cookie", `${SESSION_COOKIE}=${token}`);
  return new Request(url, { ...init, headers });
}

describe("library hub", () => {
  it("seeds English and German roadmaps plus practice-exam groups", () => {
    const english = learnerLibraryGroups.filter((g) => g.category === "ENGLISH");
    const german = learnerLibraryGroups.filter((g) => g.category === "GERMAN");
    expect(english.some((g) => g.id === "lib-en-roadmap-full")).toBe(true);
    expect(english.some((g) => g.id === "lib-en-practice-ielts")).toBe(true);
    expect(german.some((g) => g.id === "lib-de-nicos-a1")).toBe(true);
    expect(german.some((g) => g.id === "lib-de-practice-a1")).toBe(true);
    expect(german.some((g) => g.id === "lib-de-practice-b1")).toBe(true);
    expect(english.some((g) => g.isCourse)).toBe(true);
    expect(german.some((g) => g.isCourse)).toBe(true);
  });

  it("locks course episodes until start, then unlocks sequentially", () => {
    const group = { isCourse: true, startedAt: null as Date | null };
    const episodes = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(episodeUnlocked(group, 0, [], episodes)).toMatchObject({ unlocked: false });

    group.startedAt = new Date();
    expect(episodeUnlocked(group, 0, [], episodes).unlocked).toBe(true);
    expect(episodeUnlocked(group, 1, [], episodes)).toMatchObject({
      unlocked: false,
      lockedByTitle: "the previous episode",
    });
    expect(
      episodeUnlocked(
        group,
        1,
        [{ targetType: "library_episode", targetId: "a", status: "watched" }],
        episodes,
      ).unlocked,
    ).toBe(true);
  });

  it("keeps open playlists unlocked without starting", () => {
    const group = { isCourse: false, startedAt: null };
    const episodes = [{ id: "a" }, { id: "b" }];
    expect(episodeUnlocked(group, 1, [], episodes).unlocked).toBe(true);
  });

  it("lets Momen manage groups and shares a copy without progress", async () => {
    const { token } = await signIn("momen@ossu.local", LEARNER_PASSWORD);
    expect(token).toBeTruthy();

    const library = await listLibrary(authed("http://localhost/api/library", token!));
    expect(library.status).toBe(200);
    const body = await library.json();
    expect(body.groups.some((g: { id: string }) => g.id === "lib-en-roadmap-full")).toBe(true);
    expect(body.groups.some((g: { id: string }) => g.id === "lib-de-nicos-a1")).toBe(true);
    expect(body.actualMix).toBeTruthy();
    expect(typeof body.completedTotal).toBe("number");

    const tutor = await prisma.user.findUniqueOrThrow({
      where: { email: "tutor@ossu.local" },
    });
    const tutorGroups = await prisma.libraryGroup.count({ where: { ownerId: tutor.id } });
    expect(tutorGroups).toBe(0);

    const created = await createGroup(
      authed("http://localhost/api/library", token!, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "Shareable German drills",
          category: "GERMAN",
          isCourse: true,
        }),
      }),
    );
    expect(created.status).toBe(201);
    const createdBody = await created.json();

    const groupParams = { params: Promise.resolve({ id: createdBody.id as string }) };

    const episode = await addEpisode(
      authed(`http://localhost/api/library/groups/${createdBody.id}/episodes`, token!, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          title: "Sample",
        }),
      }),
      groupParams,
    );
    expect(episode.status).toBe(201);
    const episodeBody = await episode.json();

    const lockedProgress = await saveProgress(
      authed("http://localhost/api/progress", token!, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          targetType: "library_episode",
          targetId: episodeBody.id,
          action: "watched",
        }),
      }),
    );
    expect(lockedProgress.status).toBe(403);

    await startGroup(
      authed(`http://localhost/api/library/groups/${createdBody.id}/start`, token!, {
        method: "POST",
      }),
      groupParams,
    );

    const watched = await saveProgress(
      authed("http://localhost/api/progress", token!, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          targetType: "library_episode",
          targetId: episodeBody.id,
          action: "watched",
        }),
      }),
    );
    expect(watched.status).toBe(200);

    const share = await enableShare(
      authed(`http://localhost/api/library/groups/${createdBody.id}/share`, token!, {
        method: "POST",
      }),
      groupParams,
    );
    expect(share.status).toBe(200);
    const shareBody = await share.json();
    expect(shareBody.shareToken).toBeTruthy();

    const clone = await importShare(
      authed(`http://localhost/api/library/import/${shareBody.shareToken}`, token!, {
        method: "POST",
      }),
      { params: Promise.resolve({ token: shareBody.shareToken as string }) },
    );
    expect(clone.status).toBe(201);
    const cloneBody = await clone.json();
    expect(cloneBody.id).not.toBe(createdBody.id);

    const cloneDetail = await getGroup(
      authed(`http://localhost/api/library/groups/${cloneBody.id}`, token!),
      { params: Promise.resolve({ id: cloneBody.id }) },
    );
    expect(cloneDetail.status).toBe(200);
    const cloneJson = await cloneDetail.json();
    expect(cloneJson.startedAt).toBeNull();
    expect(cloneJson.episodes).toHaveLength(1);
    expect(cloneJson.episodes[0].status).toBeNull();

    const tutorToken = (await signIn("tutor@ossu.local", "review-desk")).token!;
    const tutorPatch = await patchGroup(
      authed(`http://localhost/api/library/groups/${createdBody.id}`, tutorToken, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "Hijack" }),
      }),
      groupParams,
    );
    expect(tutorPatch.status).toBe(403);
  });
});
