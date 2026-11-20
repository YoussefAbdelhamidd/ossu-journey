import { describe, expect, it } from "vitest";
import {
  courseFraction,
  courseIsUnlocked,
  findCurrentItem,
  lectureIsUnlocked,
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
    expect(current).toMatchObject({
      kind: "lecture",
      step: "finger",
      href: "/courses/intro?lecture=lec-1#finger",
    });
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
      href: "/courses/intro?lecture=lec-1#checks",
    });
  });
});

describe("sequential locks", () => {
  const track = [
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
    course({
      id: "elective-1",
      estimatedHours: 50,
      required: false,
      courseOrder: 0,
      sectionOrder: 2,
      subsectionId: "adv",
      subsectionOrder: 0,
    }),
    course({
      id: "elective-2",
      estimatedHours: 50,
      required: false,
      courseOrder: 1,
      sectionOrder: 2,
      subsectionId: "adv",
      subsectionOrder: 0,
    }),
  ];

  const withLectures = course({
    id: "video-course",
    lectures: [
      { id: "lec-b-1", number: 1, title: "One", questionCount: 0, fingerAssignmentId: null },
      { id: "lec-b-2", number: 2, title: "Two", questionCount: 0, fingerAssignmentId: null },
    ],
  });

  it("keeps later required courses locked until the previous slot is done", () => {
    expect(courseIsUnlocked("a", track, [], new Map()).unlocked).toBe(true);
    expect(courseIsUnlocked("b", track, [], new Map())).toMatchObject({
      unlocked: false,
      lockedByTitle: "a",
    });
    const afterA = [{ targetType: "course", targetId: "a", status: "completed" }];
    expect(courseIsUnlocked("b", track, afterA, new Map()).unlocked).toBe(true);
    expect(courseIsUnlocked("c-lang", track, afterA, new Map()).unlocked).toBe(false);
  });

  it("opens both choose-one options together after the previous slot", () => {
    const progress = [
      { targetType: "course", targetId: "a", status: "completed" },
      { targetType: "course", targetId: "b", status: "completed" },
    ];
    expect(courseIsUnlocked("c-lang", track, progress, new Map()).unlocked).toBe(true);
    expect(courseIsUnlocked("java-lang", track, progress, new Map()).unlocked).toBe(true);
  });

  it("locks electives until the required track is finished, then by subject order", () => {
    expect(courseIsUnlocked("elective-1", track, [], new Map()).unlocked).toBe(false);
    const requiredDone = [
      { targetType: "course", targetId: "a", status: "completed" },
      { targetType: "course", targetId: "b", status: "completed" },
      { targetType: "course", targetId: "c-lang", status: "completed" },
    ];
    expect(courseIsUnlocked("elective-1", track, requiredDone, new Map()).unlocked).toBe(true);
    expect(courseIsUnlocked("elective-2", track, requiredDone, new Map())).toMatchObject({
      unlocked: false,
      lockedByTitle: "elective-1",
    });
  });

  it("locks later lectures until the previous lecture is complete", () => {
    expect(lectureIsUnlocked(withLectures, "lec-b-1", [], new Map()).unlocked).toBe(true);
    expect(lectureIsUnlocked(withLectures, "lec-b-2", [], new Map())).toMatchObject({
      unlocked: false,
      lockedByTitle: "Lecture 1: One",
    });
    const afterFirst = [
      { targetType: "lecture", targetId: "lec-b-1", status: "completed" },
    ];
    expect(lectureIsUnlocked(withLectures, "lec-b-2", afterFirst, new Map()).unlocked).toBe(true);
  });
});
