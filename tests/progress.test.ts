import { describe, expect, it } from "vitest";
import {
  courseFraction,
  findCurrentItem,
  summarizeTrack,
  type CourseCheckpoint,
} from "@/lib/progress";

function course(partial: Partial<CourseCheckpoint> & Pick<CourseCheckpoint, "id">): CourseCheckpoint {
  return {
    title: partial.id,
    required: true,
    choiceGroup: null,
    estimatedHours: 100,
    sectionId: "core",
    sectionTitle: "Core",
    sectionOrder: partial.sectionOrder ?? 0,
    subsectionId: "sub",
    subsectionTitle: "Sub",
    subsectionOrder: 0,
    courseOrder: partial.courseOrder ?? 0,
    lectures: [],
    assignments: [],
    ...partial,
  };
}

describe("required-track progress", () => {
  const courses = [
    course({ id: "a", estimatedHours: 100, courseOrder: 0 }),
    course({ id: "b", estimatedHours: 100, courseOrder: 1 }),
    course({
      id: "c-lang",
      estimatedHours: 40,
      required: false,
      choiceGroup: "lang",
      courseOrder: 2,
    }),
    course({
      id: "java-lang",
      estimatedHours: 40,
      required: false,
      choiceGroup: "lang",
      courseOrder: 3,
    }),
    course({ id: "elective", estimatedHours: 500, required: false, courseOrder: 4 }),
  ];

  it("puts the midpoint on the course that crosses half the required hours", () => {
    const summary = summarizeTrack(courses, () => 0);
    expect(summary.totalHours).toBe(240);
    expect(summary.midpointHours).toBe(120);
    expect(summary.midpointCourseId).toBe("b");
    expect(summary.percent).toBe(0);
    expect(summary.byCourse.get("elective")).toBeUndefined();
  });

  it("counts a choose-one group once, using the furthest member", () => {
    const fractions = new Map([
      ["a", 1],
      ["b", 0],
      ["c-lang", 0.25],
      ["java-lang", 1],
      ["elective", 1],
    ]);
    const summary = summarizeTrack(courses, (item) => fractions.get(item.id) ?? 0);
    expect(summary.completedHours).toBe(140);
    expect(summary.percent).toBeCloseTo((140 / 240) * 100);
  });

  it("treats a course with no lectures as one checkpoint", () => {
    const only = course({ id: "solo" });
    expect(courseFraction(only, [], new Map())).toBe(0);
    expect(
      courseFraction(
        only,
        [{ targetType: "course", targetId: "solo", status: "completed" }],
        new Map(),
      ),
    ).toBe(1);
  });

  it("gives partial credit for a watched lecture that still has questions", () => {
    const item = course({
      id: "intro",
      lectures: [
        {
          id: "lec-1",
          number: 1,
          title: "Intro",
          questionCount: 5,
          fingerAssignmentId: "fe-1",
        },
      ],
    });
    const watched = courseFraction(
      item,
      [{ targetType: "lecture", targetId: "lec-1", status: "watched" }],
      new Map(),
    );
    expect(watched).toBeCloseTo(0.4);
    const done = courseFraction(
      item,
      [
        { targetType: "lecture", targetId: "lec-1", status: "watched" },
        { targetType: "assignment", targetId: "fe-1", status: "completed" },
      ],
      new Map([["lec-1", 5]]),
    );
    expect(done).toBe(1);
  });

  it("stops on a problem set that is due before the next lecture", () => {
    const item = course({
      id: "intro",
      lectures: [
        { id: "lec-1", number: 1, title: "One", questionCount: 0, fingerAssignmentId: null },
        { id: "lec-2", number: 2, title: "Two", questionCount: 0, fingerAssignmentId: null },
      ],
      assignments: [
        {
          id: "ps0",
          kind: "problem_set",
          code: "PS0",
          title: "Problem set 0",
          lectureNumber: null,
          dueBeforeLectureNumber: 2,
        },
      ],
    });
    const progress = [{ targetType: "lecture", targetId: "lec-1", status: "completed" }];
    const current = findCurrentItem([item], progress, new Map());
    expect(current).toMatchObject({ kind: "assignment", code: "PS0", step: "problem_set" });
  });

  it("points at the finger exercise once the video is watched", () => {
    const item = course({
      id: "intro",
      lectures: [
        {
          id: "lec-1",
          number: 1,
          title: "Intro",
          questionCount: 5,
          fingerAssignmentId: "fe-1",
        },
      ],
    });
    const current = findCurrentItem(
      [item],
      [{ targetType: "lecture", targetId: "lec-1", status: "watched" }],
      new Map(),
    );
    expect(current).toMatchObject({ kind: "lecture", step: "finger", href: "/lectures/lec-1#finger" });
  });

  it("points at unanswered checks after the finger exercise is done", () => {
    const item = course({
      id: "intro",
      lectures: [
        {
          id: "lec-1",
          number: 1,
          title: "Intro",
          questionCount: 5,
          fingerAssignmentId: "fe-1",
        },
      ],
    });
    const current = findCurrentItem(
      [item],
      [
        { targetType: "lecture", targetId: "lec-1", status: "watched" },
        { targetType: "assignment", targetId: "fe-1", status: "completed" },
      ],
      new Map([["lec-1", 2]]),
    );
    expect(current).toMatchObject({
      kind: "lecture",
      step: "questions",
      href: "/lectures/lec-1#checks",
    });
  });
});
