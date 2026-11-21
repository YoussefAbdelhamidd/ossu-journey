import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/token";
import { POST as login } from "@/app/api/auth/login/route";
import { GET as me } from "@/app/api/auth/me/route";
import { GET as dashboard } from "@/app/api/dashboard/route";
import { GET as lectureRoute } from "@/app/api/lectures/[id]/route";
import { PUT as saveAnswer } from "@/app/api/answers/route";
import { POST as saveProgress } from "@/app/api/progress/route";
import { POST as saveFeedback } from "@/app/api/tutor/feedback/route";
import { PUT as saveNotes } from "@/app/api/lectures/[id]/notes/route";
import { PUT as savePlayback } from "@/app/api/lectures/[id]/playback/route";
import { GET as courseRoute } from "@/app/api/courses/[slug]/route";

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

describe("API", () => {
  it("rejects a bad password and a missing session", async () => {
    const bad = await signIn("momen@ossu.local", "nope");
    expect(bad.response.status).toBe(401);
    const anonymous = await dashboard(new Request("http://localhost/api/dashboard"));
    expect(anonymous.status).toBe(401);
  });

  it("signs Momen in and keeps an answer without a model solution", async () => {
    const { response, token } = await signIn("momen@ossu.local", "Vdlz1L4P5icHj4aQW-Lr");
    expect(response.status).toBe(200);
    expect(token).toBeTruthy();

    const session = await me(authed("http://localhost/api/auth/me", token!));
    expect(session.status).toBe(200);
    const meBody = await session.json();
    expect(meBody.user).toMatchObject({ name: "Momen", role: "LEARNER" });

    const before = await dashboard(authed("http://localhost/api/dashboard", token!));
    const beforeBody = await before.json();
    expect(beforeBody.track.percent).toBe(0);
    expect(beforeBody.current).toMatchObject({
      kind: "lecture",
      lectureNumber: 1,
      courseId: "intro-python",
    });
    expect(beforeBody.track.midpointCourseTitle).toBeTruthy();

    const question = await prisma.question.findUniqueOrThrow({
      where: { id: "q-intro-python-1-1" },
    });
    const empty = await saveAnswer(
      authed("http://localhost/api/answers", token!, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questionId: question.id, body: "   " }),
      }),
    );
    expect(empty.status).toBe(400);

    const saved = await saveAnswer(
      authed("http://localhost/api/answers", token!, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          body: "A variable is a name bound to an object. Rebinding the name does not edit the old object.",
        }),
      }),
    );
    expect(saved.status).toBe(200);

    const lectureResponse = await lectureRoute(
      authed("http://localhost/api/lectures/lec-intro-python-1", token!),
      { params: Promise.resolve({ id: "lec-intro-python-1" }) },
    );
    expect(lectureResponse.status).toBe(200);
    const lecture = await lectureResponse.json();
    const serialized = JSON.stringify(lecture);
    expect(serialized).not.toMatch(/modelAnswer|officialAnswer|solutionText/i);
    expect(lecture.youtubeId).toBe("xAcTmDO6NTI");
    expect(lecture.questions).toHaveLength(5);
    expect(lecture.questions[0].answer.body).toContain("name bound to an object");
    expect(lecture.questions[0].answer.feedback).toBeNull();

    const forbidden = await saveFeedback(
      authed("http://localhost/api/tutor/feedback", token!, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answerId: lecture.questions[0].answer.id, body: "Nice." }),
      }),
    );
    expect(forbidden.status).toBe(403);

    const tutor = await signIn("tutor@ossu.local", "review-desk");
    const feedback = await saveFeedback(
      authed("http://localhost/api/tutor/feedback", tutor.token!, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          answerId: lecture.questions[0].answer.id,
          body: "Hold the distinction between the name and the object when you get to lists.",
        }),
      }),
    );
    expect(feedback.status).toBe(200);

    const afterFeedback = await lectureRoute(
      authed("http://localhost/api/lectures/lec-intro-python-1", token!),
      { params: Promise.resolve({ id: "lec-intro-python-1" }) },
    );
    const afterBody = await afterFeedback.json();
    expect(afterBody.questions[0].answer.feedback.body).toContain("lists");

    const watched = await saveProgress(
      authed("http://localhost/api/progress", token!, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          targetType: "lecture",
          targetId: "lec-intro-python-1",
          action: "watched",
        }),
      }),
    );
    expect(watched.status).toBe(200);

    const after = await dashboard(authed("http://localhost/api/dashboard", token!));
    const afterDash = await after.json();
    expect(afterDash.track.percent).toBeGreaterThan(0);
    expect(afterDash.counts.questionsDone).toBeGreaterThan(0);
    expect(afterDash.streak.studiedToday).toBe(true);

    const notes = await saveNotes(
      authed("http://localhost/api/lectures/lec-intro-python-1/notes", token!, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: "Names bind to objects." }),
      }),
      { params: Promise.resolve({ id: "lec-intro-python-1" }) },
    );
    expect(notes.status).toBe(200);
    expect(await notes.json()).toMatchObject({ body: "Names bind to objects." });

    const playback = await savePlayback(
      authed("http://localhost/api/lectures/lec-intro-python-1/playback", token!, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ positionSeconds: 125 }),
      }),
      { params: Promise.resolve({ id: "lec-intro-python-1" }) },
    );
    expect(playback.status).toBe(200);
    expect(await playback.json()).toMatchObject({ positionSeconds: 125 });

    const skipLecture = await saveProgress(
      authed("http://localhost/api/progress", token!, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          targetType: "lecture",
          targetId: "lec-intro-python-3",
          action: "watched",
        }),
      }),
    );
    expect(skipLecture.status).toBe(403);

    const lockedCourse = await courseRoute(
      authed("http://localhost/api/courses/systematic-program-design", token!),
      { params: Promise.resolve({ slug: "systematic-program-design" }) },
    );
    expect(lockedCourse.status).toBe(200);
    const lockedBody = await lockedCourse.json();
    expect(lockedBody.unlocked).toBe(false);
    expect(lockedBody.lockedByTitle).toBeTruthy();
  });
});
