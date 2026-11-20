import { describe, expect, it } from "vitest";
import { sections } from "../prisma/seed-data/curriculum";
import { essenceLinearAlgebra } from "../prisma/seed-data/essence-linear-algebra";
import { mit6100l, verified6100lIds } from "../prisma/seed-data/mit-6100l";

const youtubeId = /^[A-Za-z0-9_-]{11}$/;

describe("OSSU seed", () => {
  it("includes the four top-level parts of the curriculum in OSSU order", () => {
    expect(sections.map((section) => section.id)).toEqual([
      "prerequisites",
      "intro-cs",
      "core-cs",
      "advanced-cs",
      "final-project",
    ]);
    const core = sections.find((section) => section.id === "core-cs");
    expect(core?.subsections.map((subsection) => subsection.id)).toEqual([
      "core-programming",
      "core-math",
      "cs-tools",
      "core-systems",
      "core-theory",
      "core-security",
      "core-applications",
      "core-ethics",
    ]);
  });

  it("gives every course a real link and does not invent video IDs on the outline", () => {
    const courses = sections.flatMap((section) =>
      section.subsections.flatMap((subsection) => subsection.courses),
    );
    expect(courses.length).toBeGreaterThan(50);
    for (const course of courses) {
      expect(course.title.length).toBeGreaterThan(3);
      expect(course.url.startsWith("http")).toBe(true);
      expect(course.prerequisites.length).toBeGreaterThan(0);
    }
    const ids = new Set(courses.map((course) => course.id));
    expect(ids.size).toBe(courses.length);
  });

  it("seeds all 26 MIT 6.100L lectures from the verified playlist", () => {
    expect(mit6100l.lectures).toHaveLength(26);
    expect(mit6100l.lectures.map((lecture) => lecture.youtubeId)).toEqual(verified6100lIds);
    for (const lecture of mit6100l.lectures) {
      expect(lecture.youtubeId).toMatch(youtubeId);
      expect(lecture.pageUrl).toContain("ocw.mit.edu");
      expect(lecture.slidesUrl).toMatch(/lec\d{2}\.pdf$/);
      expect(lecture.codeUrl).toMatch(/lec\d{2}_code\.(py|zip)$/);
      expect(lecture.questions?.length).toBeGreaterThanOrEqual(4);
      expect(lecture.questions?.length).toBeLessThanOrEqual(6);
      const prompts = new Set(lecture.questions?.map((question) => question.prompt));
      expect(prompts.size).toBe(lecture.questions?.length);
    }
    expect(mit6100l.lectures[19]?.youtubeId).toBe("-wyc5FwzkcM");
  });

  it("places problem sets and finger exercises on the OCW calendar", () => {
    const assignments = mit6100l.assignments ?? [];
    const due = Object.fromEntries(
      assignments
        .filter((item) => item.kind === "problem_set")
        .map((item) => [item.code, item.dueBeforeLectureNumber]),
    );
    expect(due).toEqual({ PS0: 2, PS1: 9, PS2: 12, PS3: 16, PS4: 20, PS5: 25 });
    expect(assignments.find((item) => item.code === "PS0")?.graded).toBe(false);
    const fingers = assignments
      .filter((item) => item.kind === "finger")
      .map((item) => item.lectureNumber)
      .sort((a, b) => (a ?? 0) - (b ?? 0));
    expect(fingers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23]);
    for (const assignment of assignments) {
      if (assignment.url) expect(assignment.url.startsWith("https://ocw.mit.edu/")).toBe(true);
    }
  });

  it("seeds Essence of Linear Algebra only with playlist IDs that were verified", () => {
    expect(essenceLinearAlgebra.lectures).toHaveLength(16);
    for (const lecture of essenceLinearAlgebra.lectures) {
      expect(lecture.youtubeId).toMatch(youtubeId);
      expect(lecture.questions ?? []).toHaveLength(0);
    }
    expect(essenceLinearAlgebra.lectures[0]?.youtubeId).toBe("fNk_zzaMoSs");
  });
});
