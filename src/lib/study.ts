import { cache } from "react";
import { prisma } from "./db";
import type { SessionUser } from "./auth";
import { ApiError } from "./auth";
import {
  assignmentIsReachable,
  courseFraction,
  courseIsUnlocked,
  findCurrentItem,
  formatDuration,
  lectureIsUnlocked,
  lectureScore,
  summarizeTrack,
  tallyWork,
  type AssignmentCheckpoint,
  type CourseCheckpoint,
  type CurrentItem,
  type LectureCheckpoint,
  type ProgressRow,
} from "./progress";
import {
  cairoDate,
  computeStreak,
  greeting,
  inMorningWindow,
  recentDates,
  weekdayNarrow,
} from "./time";

type LectureRecord = {
  id: string;
  courseId: string;
  number: number;
  title: string;
  summary: string;
  readings: string | null;
  youtubeId: string | null;
  videoTodo: string | null;
  durationSeconds: number | null;
  pageUrl: string | null;
  slidesUrl: string | null;
  codeUrl: string | null;
  questions: { id: string; order: number; kind: string; prompt: string }[];
};

type AssignmentRecord = {
  id: string;
  courseId: string;
  kind: string;
  code: string;
  title: string;
  summary: string;
  url: string | null;
  codeUrl: string | null;
  solutionsUrl: string | null;
  lectureNumber: number | null;
  dueBeforeLectureNumber: number | null;
  releasedAtLectureNumber: number | null;
  graded: boolean;
  order: number;
};

type ReadingRecord = {
  id: string;
  title: string;
  author: string | null;
  kind: string;
  url: string;
  summary: string | null;
  order: number;
};

type CourseRecord = {
  id: string;
  title: string;
  provider: string | null;
  instructor: string | null;
  url: string;
  altUrl: string | null;
  guideUrl: string | null;
  discussionUrl: string | null;
  playlistUrl: string | null;
  durationWeeks: number | null;
  durationLabel: string | null;
  hoursPerWeekMin: number | null;
  hoursPerWeekMax: number | null;
  estimatedHours: number | null;
  prerequisites: string;
  notes: string | null;
  required: boolean;
  choiceGroup: string | null;
  videoTodo: string | null;
  coverImage: string | null;
  offersCertificate: boolean;
  certificateLabel: string | null;
  order: number;
  lectures: LectureRecord[];
  assignments: AssignmentRecord[];
  readings: ReadingRecord[];
  subsection: {
    id: string;
    title: string;
    summary: string;
    topics: string;
    order: number;
    section: {
      id: string;
      title: string;
      summary: string;
      order: number;
      coverImage: string | null;
    };
  };
};

const courseInclude = {
  lectures: {
    orderBy: { number: "asc" as const },
    include: { questions: { orderBy: { order: "asc" as const } } },
  },
  assignments: { orderBy: { order: "asc" as const } },
  readings: { orderBy: { order: "asc" as const } },
  subsection: { include: { section: true } },
};

function isTutor(user: SessionUser) {
  return user.role === "TUTOR";
}

export async function loadCourses(): Promise<CourseRecord[]> {
  return prisma.course.findMany({
    include: courseInclude,
    orderBy: { order: "asc" },
  });
}

function toCheckpoint(course: CourseRecord): CourseCheckpoint {
  const fingerByLecture = new Map<number, string>();
  for (const assignment of course.assignments) {
    if (assignment.kind === "finger" && assignment.lectureNumber != null) {
      fingerByLecture.set(assignment.lectureNumber, assignment.id);
    }
  }
  const lectures: LectureCheckpoint[] = course.lectures.map((lecture) => ({
    id: lecture.id,
    number: lecture.number,
    title: lecture.title,
    questionCount: lecture.questions.length,
    fingerAssignmentId: fingerByLecture.get(lecture.number) ?? null,
  }));
  const assignments: AssignmentCheckpoint[] = course.assignments.map((assignment) => ({
    id: assignment.id,
    kind: assignment.kind,
    code: assignment.code,
    title: assignment.title,
    lectureNumber: assignment.lectureNumber,
    dueBeforeLectureNumber: assignment.dueBeforeLectureNumber,
  }));
  return {
    id: course.id,
    title: course.title,
    required: course.required,
    choiceGroup: course.choiceGroup,
    estimatedHours: course.estimatedHours,
    sectionId: course.subsection.section.id,
    sectionTitle: course.subsection.section.title,
    sectionOrder: course.subsection.section.order,
    subsectionId: course.subsection.id,
    subsectionTitle: course.subsection.title,
    subsectionOrder: course.subsection.order,
    courseOrder: course.order,
    lectures,
    assignments,
  };
}

async function learnerState(userId: string) {
  const [progress, answers, studyDays] = await Promise.all([
    prisma.progress.findMany({ where: { userId } }),
    prisma.answer.findMany({
      where: { userId },
      select: { questionId: true, body: true },
    }),
    prisma.studyDay.findMany({ where: { userId } }),
  ]);
  const progressRows: ProgressRow[] = progress.map((row) => ({
    targetType: row.targetType,
    targetId: row.targetId,
    status: row.status,
    manual: row.manual,
  }));
  return { progress: progressRows, answers, studyDays };
}

function answeredByLecture(
  courses: CourseRecord[],
  answers: { questionId: string; body: string }[],
): Map<string, number> {
  const questionLecture = new Map<string, string>();
  for (const course of courses) {
    for (const lecture of course.lectures) {
      for (const question of lecture.questions) {
        questionLecture.set(question.id, lecture.id);
      }
    }
  }
  const counts = new Map<string, number>();
  for (const answer of answers) {
    if (!answer.body.trim()) continue;
    const lectureId = questionLecture.get(answer.questionId);
    if (!lectureId) continue;
    counts.set(lectureId, (counts.get(lectureId) ?? 0) + 1);
  }
  return counts;
}

export async function recordStudy(userId: string, at = new Date()) {
  const date = cairoDate(at);
  const inWindow = inMorningWindow(at);
  const existing = await prisma.studyDay.findUnique({
    where: { userId_date: { userId, date } },
  });
  if (!existing) {
    await prisma.studyDay.create({ data: { userId, date, inWindow } });
    return;
  }
  if (inWindow && !existing.inWindow) {
    await prisma.studyDay.update({
      where: { id: existing.id },
      data: { inWindow: true },
    });
  }
}

function lectureIsComplete(
  lecture: LectureCheckpoint,
  progress: ProgressRow[],
  answeredCount: number,
): boolean {
  const row = progress.find(
    (item) => item.targetType === "lecture" && item.targetId === lecture.id,
  );
  if (row?.status === "completed" && row.manual) return true;
  const fingerDone = lecture.fingerAssignmentId
    ? progress.some(
        (item) =>
          item.targetType === "assignment" &&
          item.targetId === lecture.fingerAssignmentId &&
          item.status === "completed",
      )
    : true;
  const hasRequirements = lecture.questionCount > 0 || lecture.fingerAssignmentId != null;
  const requirementsMet = answeredCount >= lecture.questionCount && fingerDone;
  if (!hasRequirements) return row?.status === "watched" || row?.status === "completed";
  return (row?.status === "watched" || row?.status === "completed") && requirementsMet;
}

async function refreshLecture(userId: string, lectureId: string) {
  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
    include: {
      questions: true,
      course: { include: { assignments: true } },
    },
  });
  if (!lecture) return;
  const finger = lecture.course.assignments.find(
    (item) => item.kind === "finger" && item.lectureNumber === lecture.number,
  );
  const [progress, answers] = await Promise.all([
    prisma.progress.findMany({
      where: {
        userId,
        OR: [
          { targetType: "lecture", targetId: lecture.id },
          ...(finger ? [{ targetType: "assignment", targetId: finger.id }] : []),
        ],
      },
    }),
    prisma.answer.count({
      where: {
        userId,
        questionId: { in: lecture.questions.map((question) => question.id) },
        NOT: { body: "" },
      },
    }),
  ]);
  const checkpoint: LectureCheckpoint = {
    id: lecture.id,
    number: lecture.number,
    title: lecture.title,
    questionCount: lecture.questions.length,
    fingerAssignmentId: finger?.id ?? null,
  };
  const rows: ProgressRow[] = progress.map((row) => ({
    targetType: row.targetType,
    targetId: row.targetId,
    status: row.status,
    manual: row.manual,
  }));
  const complete = lectureIsComplete(checkpoint, rows, answers);
  const existing = progress.find((row) => row.targetType === "lecture");
  if (existing?.manual && existing.status === "completed") return;
  if (complete) {
    await prisma.progress.upsert({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: "lecture",
          targetId: lecture.id,
        },
      },
      update: { status: "completed", manual: false },
      create: { userId, targetType: "lecture", targetId: lecture.id, status: "completed" },
    });
    return;
  }
  if (existing?.status === "completed" && !existing.manual) {
    await prisma.progress.update({
      where: { id: existing.id },
      data: { status: "watched", manual: false },
    });
  }
}

export async function setProgress(user: SessionUser, input: {
  targetType: "lecture" | "assignment" | "course" | "library_episode" | "library_group";
  targetId: string;
  action: "watched" | "completed" | "clear";
}) {
  if (input.targetType === "library_episode" || input.targetType === "library_group") {
    if (user.role !== "LEARNER") throw new ApiError(403, "Learners only.");
    if (input.targetType === "library_group") {
      const group = await prisma.libraryGroup.findUnique({ where: { id: input.targetId } });
      if (!group || group.ownerId !== user.id) throw new ApiError(404, "Group not found.");
      if (input.action === "watched") {
        throw new ApiError(400, "Groups are marked complete, not watched.");
      }
    } else {
      const episode = await prisma.libraryEpisode.findUnique({
        where: { id: input.targetId },
        include: { group: { include: { episodes: { orderBy: { order: "asc" } } } } },
      });
      if (!episode || episode.group.ownerId !== user.id) {
        throw new ApiError(404, "Episode not found.");
      }
      if (input.action !== "clear") {
        const { episodeUnlocked } = await import("./library");
        const progress = await prisma.progress.findMany({
          where: {
            userId: user.id,
            targetType: "library_episode",
            targetId: { in: episode.group.episodes.map((e) => e.id) },
          },
        });
        const index = episode.group.episodes.findIndex((e) => e.id === episode.id);
        const lock = episodeUnlocked(episode.group, index, progress, episode.group.episodes);
        if (!lock.unlocked) {
          throw new ApiError(
            403,
            episode.group.isCourse && !episode.group.startedAt
              ? "Start this course before watching episodes."
              : `Finish ${lock.lockedByTitle} first.`,
          );
        }
      }
    }

    if (input.action === "clear") {
      await prisma.progress.deleteMany({
        where: { userId: user.id, targetType: input.targetType, targetId: input.targetId },
      });
    } else {
      await prisma.progress.upsert({
        where: {
          userId_targetType_targetId: {
            userId: user.id,
            targetType: input.targetType,
            targetId: input.targetId,
          },
        },
        update: {
          status: input.action === "completed" ? "completed" : "watched",
          manual: input.action === "completed",
        },
        create: {
          userId: user.id,
          targetType: input.targetType,
          targetId: input.targetId,
          status: input.action === "completed" ? "completed" : "watched",
          manual: input.action === "completed",
        },
      });
    }
    await recordStudy(user.id);
    return { ok: true };
  }

  const courses = await loadCourses();
  const state = await learnerState(user.id);
  const answered = answeredByLecture(courses, state.answers);
  const checkpoints = courses.map(toCheckpoint);

  if (input.targetType === "lecture") {
    const lecture = await prisma.lecture.findUnique({ where: { id: input.targetId } });
    if (!lecture) throw new ApiError(404, "Lecture not found.");
    if (!isTutor(user) && input.action !== "clear") {
      const courseLock = courseIsUnlocked(lecture.courseId, checkpoints, state.progress, answered);
      if (!courseLock.unlocked) {
        throw new ApiError(403, `Finish ${courseLock.lockedByTitle} first.`);
      }
      const checkpoint = checkpoints.find((item) => item.id === lecture.courseId);
      if (checkpoint) {
        const lectureLock = lectureIsUnlocked(
          checkpoint,
          lecture.id,
          state.progress,
          answered,
        );
        if (!lectureLock.unlocked) {
          throw new ApiError(403, `Finish ${lectureLock.lockedByTitle} first.`);
        }
      }
    }
  } else if (input.targetType === "assignment") {
    const assignment = await prisma.assignment.findUnique({ where: { id: input.targetId } });
    if (!assignment) throw new ApiError(404, "Assignment not found.");
    if (input.action === "watched") {
      throw new ApiError(400, "Assignments are marked done, not watched.");
    }
    if (!isTutor(user) && input.action !== "clear") {
      const courseLock = courseIsUnlocked(assignment.courseId, checkpoints, state.progress, answered);
      if (!courseLock.unlocked) {
        throw new ApiError(403, `Finish ${courseLock.lockedByTitle} first.`);
      }
      const checkpoint = checkpoints.find((item) => item.id === assignment.courseId);
      if (checkpoint) {
        const reach = assignmentIsReachable(
          checkpoint,
          assignment.id,
          state.progress,
          answered,
        );
        if (!reach.unlocked) {
          throw new ApiError(403, `Finish ${reach.lockedByTitle} first.`);
        }
      }
    }
  } else {
    const course = await prisma.course.findUnique({ where: { id: input.targetId } });
    if (!course) throw new ApiError(404, "Course not found.");
    if (input.action === "watched") {
      throw new ApiError(400, "Courses are marked complete, not watched.");
    }
    if (!isTutor(user) && input.action !== "clear") {
      const courseLock = courseIsUnlocked(course.id, checkpoints, state.progress, answered);
      if (!courseLock.unlocked) {
        throw new ApiError(403, `Finish ${courseLock.lockedByTitle} first.`);
      }
    }
  }

  if (input.action === "clear") {
    await prisma.progress.deleteMany({
      where: { userId: user.id, targetType: input.targetType, targetId: input.targetId },
    });
  } else {
    await prisma.progress.upsert({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType: input.targetType,
          targetId: input.targetId,
        },
      },
      update: {
        status: input.action === "completed" ? "completed" : "watched",
        manual: input.action === "completed",
      },
      create: {
        userId: user.id,
        targetType: input.targetType,
        targetId: input.targetId,
        status: input.action === "completed" ? "completed" : "watched",
        manual: input.action === "completed",
      },
    });
  }

  if (input.targetType === "lecture") {
    await refreshLecture(user.id, input.targetId);
  }
  if (input.targetType === "assignment") {
    const assignment = await prisma.assignment.findUnique({ where: { id: input.targetId } });
    if (assignment?.kind === "finger" && assignment.lectureNumber != null) {
      const lecture = await prisma.lecture.findFirst({
        where: { courseId: assignment.courseId, number: assignment.lectureNumber },
      });
      if (lecture) await refreshLecture(user.id, lecture.id);
    }
  }

  await recordStudy(user.id);
  return { ok: true };
}

export async function saveAnswer(user: SessionUser, questionId: string, body: string) {
  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) throw new ApiError(404, "Question not found.");
  const answer = await prisma.answer.upsert({
    where: { userId_questionId: { userId: user.id, questionId } },
    update: { body },
    create: { userId: user.id, questionId, body },
  });
  await refreshLecture(user.id, question.lectureId);
  await recordStudy(user.id);
  return {
    id: answer.id,
    questionId: answer.questionId,
    body: answer.body,
    updatedAt: answer.updatedAt.toISOString(),
  };
}

export async function saveFeedback(tutor: SessionUser, answerId: string, body: string) {
  const answer = await prisma.answer.findUnique({ where: { id: answerId } });
  if (!answer) throw new ApiError(404, "Answer not found.");
  const feedback = await prisma.feedback.upsert({
    where: { answerId },
    update: { body, tutorId: tutor.id },
    create: { answerId, body, tutorId: tutor.id },
  });
  return {
    id: feedback.id,
    answerId: feedback.answerId,
    body: feedback.body,
    updatedAt: feedback.updatedAt.toISOString(),
  };
}

function effortLabel(course: CourseRecord): string | null {
  const weeks = course.durationLabel ?? (course.durationWeeks != null ? `${course.durationWeeks} weeks` : null);
  if (course.hoursPerWeekMin == null || course.hoursPerWeekMax == null) return weeks;
  const hours =
    course.hoursPerWeekMin === course.hoursPerWeekMax
      ? `${course.hoursPerWeekMin} h/week`
      : `${course.hoursPerWeekMin}–${course.hoursPerWeekMax} h/week`;
  return weeks ? `${weeks} · ${hours}` : hours;
}

export const getDashboard = cache(async function getDashboard(user: SessionUser) {
  const courses = await loadCourses();
  const state = await learnerState(user.id);
  const answered = answeredByLecture(courses, state.answers);
  const checkpoints = courses.map(toCheckpoint);
  const fractionOf = (course: CourseCheckpoint) => courseFraction(course, state.progress, answered);
  const track = summarizeTrack(checkpoints, fractionOf);
  const current = findCurrentItem(checkpoints, state.progress, answered);
  const today = cairoDate();
  const streak = computeStreak(
    state.studyDays.map((day) => day.date),
    today,
  );
  const studyByDate = new Map(state.studyDays.map((day) => [day.date, day]));
  const midpointCourse = courses.find((course) => course.id === track.midpointCourseId);

  const groups = new Map<
    string,
    {
      id: string;
      title: string;
      sectionTitle: string;
      order: number;
      courses: { id: string; title: string; percent: number; required: boolean }[];
    }
  >();

  for (const course of courses) {
    const key = course.subsection.id;
    const group = groups.get(key) ?? {
      id: key,
      title: course.subsection.title,
      sectionTitle: course.subsection.section.title,
      order: course.subsection.section.order * 100 + course.subsection.order,
      courses: [],
    };
    const checkpoint = checkpoints.find((item) => item.id === course.id)!;
    group.courses.push({
      id: course.id,
      title: course.title,
      percent: Math.round(fractionOf(checkpoint) * 1000) / 10,
      required: course.required || course.choiceGroup != null,
    });
    groups.set(key, group);
  }

  const requiredCourses = checkpoints.filter((course) => course.required || course.choiceGroup);
  const trackTally = tallyWork(requiredCourses, state.progress, answered);
  const currentCourse = current
    ? checkpoints.find((course) => course.id === current.courseId) ?? null
    : null;
  const courseTally = currentCourse
    ? tallyWork([currentCourse], state.progress, answered)
    : null;
  const coursesDone = track.slots.filter((slot) => slot.fraction >= 0.999).length;
  const feedbackReceived = await prisma.feedback.count({
    where: { answer: { userId: user.id } },
  });
  const hoursUntilMidpoint = Math.max(0, track.midpointHours - track.completedHours);
  const step = current;
  let focusLectureId: string | null = null;
  let focusAssignmentId: string | null = null;
  if (step && step.kind === "lecture") focusLectureId = step.lectureId;
  if (step && step.kind === "assignment") focusAssignmentId = step.assignmentId;
  const currentRecord = step ? courses.find((course) => course.id === step.courseId) ?? null : null;
  const timeline = currentRecord
    ? currentRecord.lectures.map((lecture) => {
        const checkpoint = currentCourse?.lectures.find((item) => item.id === lecture.id);
        const fingerDone = checkpoint?.fingerAssignmentId
          ? state.progress.some(
              (item) =>
                item.targetType === "assignment" &&
                item.targetId === checkpoint.fingerAssignmentId &&
                item.status === "completed",
            )
          : false;
        const done =
          checkpoint != null &&
          lectureScore(
            checkpoint,
            state.progress,
            answered.get(lecture.id) ?? 0,
            fingerDone,
          ) >= 0.999;
        const lock =
          currentCourse != null
            ? lectureIsUnlocked(currentCourse, lecture.id, state.progress, answered)
            : { unlocked: false, lockedByTitle: null };
        const isCurrentLecture = focusLectureId === lecture.id;
        const isCurrentGate =
          focusAssignmentId != null &&
          currentRecord.assignments.some(
            (assignment) =>
              assignment.id === focusAssignmentId &&
              assignment.dueBeforeLectureNumber === lecture.number,
          );
        const isCurrent = lock.unlocked && !done && (isCurrentLecture || isCurrentGate);
        return {
          id: lecture.id,
          number: lecture.number,
          title: lecture.title,
          href: `/courses/${currentRecord.id}?lecture=${lecture.id}`,
          state: (done
            ? "done"
            : isCurrent
              ? "current"
              : lock.unlocked
                ? "upcoming"
                : "locked") as "done" | "current" | "upcoming" | "locked",
        };
      })
    : [];

  return {
    learner: { name: user.name, timezone: user.timezone },
    greeting: greeting(),
    morning: {
      timezone: "Africa/Cairo",
      label: "7:00–9:00",
      openNow: inMorningWindow(),
      studiedInWindowToday: studyByDate.get(today)?.inWindow ?? false,
    },
    streak: {
      ...streak,
      days: recentDates(today, 14).map((date) => ({
        date,
        label: weekdayNarrow(date),
        studied: studyByDate.has(date),
        inWindow: studyByDate.get(date)?.inWindow ?? false,
        today: date === today,
      })),
    },
    track: {
      percent: track.percent,
      completedHours: track.completedHours,
      totalHours: track.totalHours,
      midpointCourseId: track.midpointCourseId,
      midpointCourseTitle: midpointCourse?.title ?? null,
      midpointLabel: "Start US remote applications",
      hoursUntilMidpoint,
      pastMidpoint: track.totalHours > 0 && track.completedHours >= track.midpointHours,
      coursesDone,
      coursesTotal: track.slots.length,
    },
    current,
    currentCourse: currentCourse
      ? {
          id: currentCourse.id,
          title: currentCourse.title,
          coverImage: courses.find((course) => course.id === currentCourse.id)?.coverImage ?? null,
          percent: Math.round(fractionOf(currentCourse) * 1000) / 10,
          tally: courseTally,
        }
      : null,
    timeline,
    counts: {
      ...trackTally,
      coursesDone,
      coursesTotal: track.slots.length,
      feedbackReceived,
    },
    groups: [...groups.values()].sort((a, b) => a.order - b.order),
  };
});

export async function getCurriculum(user: SessionUser) {
  const courses = await loadCourses();
  const sections = await prisma.section.findMany({
    orderBy: { order: "asc" },
    include: { subsections: { orderBy: { order: "asc" } } },
  });
  const state = await learnerState(user.id);
  const answered = answeredByLecture(courses, state.answers);
  const checkpoints = courses.map(toCheckpoint);
  const fractionOf = (course: CourseCheckpoint) => courseFraction(course, state.progress, answered);
  const track = summarizeTrack(checkpoints, fractionOf);
  const current = findCurrentItem(checkpoints, state.progress, answered);

  return {
    sections: sections.map((section) => {
      return {
        id: section.id,
        title: section.title,
        summary: section.summary,
        coverImage: section.coverImage,
        subsections: section.subsections.map((subsection) => ({
          id: subsection.id,
          title: subsection.title,
          summary: subsection.summary,
          topics: JSON.parse(subsection.topics) as string[],
          courses: courses
            .filter((course) => course.subsection.id === subsection.id)
            .sort((a, b) => a.order - b.order)
            .map((course) => {
              const checkpoint = checkpoints.find((item) => item.id === course.id)!;
              const fraction = fractionOf(checkpoint);
              const lock = isTutor(user)
                ? { unlocked: true, lockedByTitle: null }
                : courseIsUnlocked(course.id, checkpoints, state.progress, answered);
              return {
                id: course.id,
                title: course.title,
                provider: course.provider,
                effort: effortLabel(course),
                estimatedHours: course.estimatedHours,
                required: course.required,
                choiceGroup: course.choiceGroup,
                percent: Math.round(fraction * 1000) / 10,
                lectureCount: course.lectures.length,
                containsMidpoint: track.byCourse.get(course.id)?.containsMidpoint ?? false,
                isCurrent: current?.courseId === course.id,
                videoTodo: course.lectures.length === 0 ? course.videoTodo : null,
                coverImage: course.coverImage,
                unlocked: lock.unlocked,
                lockedByTitle: lock.lockedByTitle,
                offersCertificate: course.offersCertificate,
              };
            }),
        })),
      };
    }),
    track: {
      percent: track.percent,
      midpointCourseId: track.midpointCourseId,
    },
    current,
  };
}

export async function getCourse(user: SessionUser, slug: string) {
  const course = await prisma.course.findUnique({
    where: { id: slug },
    include: courseInclude,
  });
  if (!course) throw new ApiError(404, "Course not found.");
  const courses = await loadCourses();
  const state = await learnerState(user.id);
  const answered = answeredByLecture(courses, state.answers);
  const checkpoint = toCheckpoint(course);
  const checkpoints = courses.map(toCheckpoint);
  const current = findCurrentItem(checkpoints, state.progress, answered);
  const progressFor = (type: string, id: string) =>
    state.progress.find((item) => item.targetType === type && item.targetId === id);
  const courseLock = isTutor(user)
    ? { unlocked: true, lockedByTitle: null }
    : courseIsUnlocked(course.id, checkpoints, state.progress, answered);

  const lectureIds = course.lectures.map((lecture) => lecture.id);
  const questionIds = course.lectures.flatMap((lecture) =>
    lecture.questions.map((question) => question.id),
  );
  const [notes, playbacks, answers] = await Promise.all([
    prisma.lectureNote.findMany({
      where: { userId: user.id, lectureId: { in: lectureIds } },
    }),
    prisma.playback.findMany({
      where: { userId: user.id, lectureId: { in: lectureIds } },
    }),
    prisma.answer.findMany({
      where: { userId: user.id, questionId: { in: questionIds } },
      include: { feedback: true },
    }),
  ]);
  const noteByLecture = new Map(notes.map((note) => [note.lectureId, note]));
  const playbackByLecture = new Map(playbacks.map((row) => [row.lectureId, row]));
  const answerByQuestion = new Map(answers.map((answer) => [answer.questionId, answer]));

  const lectures = course.lectures.map((lecture) => {
    const row = progressFor("lecture", lecture.id);
    const finger = course.assignments.find(
      (item) => item.kind === "finger" && item.lectureNumber === lecture.number,
    );
    const lectureCheckpoint = checkpoint.lectures.find((item) => item.id === lecture.id);
    const fingerDone = finger
      ? progressFor("assignment", finger.id)?.status === "completed"
      : false;
    const done =
      lectureCheckpoint != null &&
      lectureScore(
        lectureCheckpoint,
        state.progress,
        answered.get(lecture.id) ?? 0,
        Boolean(fingerDone),
      ) >= 0.999;
    const lectureLock =
      isTutor(user) || !courseLock.unlocked
        ? {
            unlocked: courseLock.unlocked || isTutor(user),
            lockedByTitle: courseLock.lockedByTitle,
          }
        : lectureIsUnlocked(checkpoint, lecture.id, state.progress, answered);
    const isCurrent =
      courseLock.unlocked &&
      lectureLock.unlocked &&
      !done &&
      ((current?.kind === "lecture" && current.lectureId === lecture.id) ||
        (current?.kind === "assignment" &&
          course.assignments.some(
            (assignment) =>
              assignment.id === current.assignmentId &&
              assignment.dueBeforeLectureNumber === lecture.number,
          )));
    const requirements: string[] = [];
    if (row?.status !== "watched" && row?.status !== "completed") {
      requirements.push("Mark the video watched");
    }
    const unanswered = lecture.questions.filter((question) => {
      const answer = answerByQuestion.get(question.id);
      return !answer?.body.trim();
    }).length;
    if (unanswered > 0) {
      requirements.push(
        unanswered === 1
          ? "Answer 1 understanding check"
          : `Answer ${unanswered} understanding checks`,
      );
    }
    if (finger && !fingerDone) requirements.push("Mark the finger exercise done");

    return {
      id: lecture.id,
      number: lecture.number,
      title: lecture.title,
      summary: lecture.summary,
      readings: lecture.readings,
      youtubeId: lecture.youtubeId,
      videoTodo: lecture.videoTodo,
      duration: formatDuration(lecture.durationSeconds),
      durationSeconds: lecture.durationSeconds,
      pageUrl: lecture.pageUrl,
      slidesUrl: lecture.slidesUrl,
      codeUrl: lecture.codeUrl,
      hasVideo: Boolean(lecture.youtubeId),
      questionCount: lecture.questions.length,
      status: row?.status ?? null,
      manual: row?.manual ?? false,
      complete: done,
      requirements,
      unlocked: lectureLock.unlocked,
      lockedByTitle: lectureLock.lockedByTitle,
      pathState: (done
        ? "done"
        : isCurrent
          ? "current"
          : lectureLock.unlocked
            ? "upcoming"
            : "locked") as "done" | "current" | "upcoming" | "locked",
      noteBody: noteByLecture.get(lecture.id)?.body ?? "",
      positionSeconds: playbackByLecture.get(lecture.id)?.positionSeconds ?? 0,
      finger: finger
        ? {
            id: finger.id,
            title: finger.title,
            summary: finger.summary,
            url: finger.url,
            solutionsUrl: finger.solutionsUrl,
            done: Boolean(fingerDone),
          }
        : null,
      questions: lecture.questions.map((question) => {
        const answer = answerByQuestion.get(question.id);
        return {
          id: question.id,
          order: question.order,
          kind: question.kind,
          prompt: question.prompt,
          answer: answer
            ? {
                id: answer.id,
                body: answer.body,
                updatedAt: answer.updatedAt.toISOString(),
                feedback: answer.feedback
                  ? {
                      body: answer.feedback.body,
                      updatedAt: answer.feedback.updatedAt.toISOString(),
                    }
                  : null,
              }
            : null,
        };
      }),
    };
  });

  return {
    id: course.id,
    title: course.title,
    provider: course.provider,
    instructor: course.instructor,
    url: course.url,
    altUrl: course.altUrl,
    guideUrl: course.guideUrl,
    discussionUrl: course.discussionUrl,
    playlistUrl: course.playlistUrl,
    effort: effortLabel(course),
    estimatedHours: course.estimatedHours,
    prerequisites: course.prerequisites,
    notes: course.notes,
    required: course.required,
    choiceGroup: course.choiceGroup,
    videoTodo: course.videoTodo,
    coverImage: course.coverImage,
    offersCertificate: course.offersCertificate,
    certificateLabel: course.certificateLabel,
    sectionTitle: course.subsection.section.title,
    subsectionTitle: course.subsection.title,
    sectionCoverImage: course.subsection.section.coverImage,
    percent: Math.round(courseFraction(checkpoint, state.progress, answered) * 1000) / 10,
    courseCompleted: progressFor("course", course.id)?.status === "completed",
    hasLecturePlan: course.lectures.length > 0 || course.assignments.length > 0,
    unlocked: courseLock.unlocked,
    lockedByTitle: courseLock.lockedByTitle,
    lectures,
    readings: course.readings.map((reading) => ({
      id: reading.id,
      title: reading.title,
      author: reading.author,
      kind: reading.kind,
      url: reading.url,
      summary: reading.summary,
    })),
    assignments: course.assignments.map((assignment) => ({
      id: assignment.id,
      kind: assignment.kind,
      code: assignment.code,
      title: assignment.title,
      summary: assignment.summary,
      url: assignment.url,
      codeUrl: assignment.codeUrl,
      solutionsUrl: assignment.solutionsUrl,
      lectureNumber: assignment.lectureNumber,
      dueBeforeLectureNumber: assignment.dueBeforeLectureNumber,
      graded: assignment.graded,
      done: progressFor("assignment", assignment.id)?.status === "completed",
    })),
  };
}

export async function getLecture(user: SessionUser, id: string) {
  const lecture = await prisma.lecture.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      course: { include: { lectures: { orderBy: { number: "asc" } }, assignments: true } },
    },
  });
  if (!lecture) throw new ApiError(404, "Lecture not found.");

  const courses = await loadCourses();
  const state = await learnerState(user.id);
  const answered = answeredByLecture(courses, state.answers);
  const checkpoints = courses.map(toCheckpoint);
  const courseLock = isTutor(user)
    ? { unlocked: true, lockedByTitle: null }
    : courseIsUnlocked(lecture.courseId, checkpoints, state.progress, answered);
  const checkpoint = checkpoints.find((item) => item.id === lecture.courseId);
  const lectureLock =
    isTutor(user) || !courseLock.unlocked
      ? {
          unlocked: courseLock.unlocked || isTutor(user),
          lockedByTitle: courseLock.lockedByTitle,
        }
      : checkpoint
        ? lectureIsUnlocked(checkpoint, lecture.id, state.progress, answered)
        : { unlocked: false, lockedByTitle: null };

  const questionIds = lecture.questions.map((question) => question.id);
  const [answers, progress, note, playback] = await Promise.all([
    prisma.answer.findMany({
      where: { userId: user.id, questionId: { in: questionIds } },
      include: { feedback: true },
    }),
    prisma.progress.findMany({
      where: {
        userId: user.id,
        OR: [
          { targetType: "lecture", targetId: lecture.id },
          {
            targetType: "assignment",
            targetId: {
              in: lecture.course.assignments.map((assignment) => assignment.id),
            },
          },
        ],
      },
    }),
    prisma.lectureNote.findUnique({
      where: { userId_lectureId: { userId: user.id, lectureId: lecture.id } },
    }),
    prisma.playback.findUnique({
      where: { userId_lectureId: { userId: user.id, lectureId: lecture.id } },
    }),
  ]);
  const answerByQuestion = new Map(answers.map((answer) => [answer.questionId, answer]));
  const lectureProgress = progress.find((item) => item.targetType === "lecture");
  const finger = lecture.course.assignments.find(
    (item) => item.kind === "finger" && item.lectureNumber === lecture.number,
  );
  const due = lecture.course.assignments.filter(
    (item) => item.kind === "problem_set" && item.dueBeforeLectureNumber === lecture.number,
  );
  const ordered = lecture.course.lectures;
  const index = ordered.findIndex((item) => item.id === lecture.id);
  const previous = index > 0 ? ordered[index - 1] : null;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null;

  const requirements: string[] = [];
  if (lectureProgress?.status !== "watched" && lectureProgress?.status !== "completed") {
    requirements.push("Mark the video watched");
  }
  const unanswered = lecture.questions.filter((question) => {
    const answer = answerByQuestion.get(question.id);
    return !answer?.body.trim();
  }).length;
  if (unanswered > 0) {
    requirements.push(
      unanswered === 1
        ? "Answer 1 understanding check"
        : `Answer ${unanswered} understanding checks`,
    );
  }
  if (
    finger &&
    !progress.some((item) => item.targetId === finger.id && item.status === "completed")
  ) {
    requirements.push("Mark the finger exercise done");
  }

  return {
    id: lecture.id,
    number: lecture.number,
    title: lecture.title,
    summary: lecture.summary,
    readings: lecture.readings,
    youtubeId: lecture.youtubeId,
    videoTodo: lecture.videoTodo,
    duration: formatDuration(lecture.durationSeconds),
    pageUrl: lecture.pageUrl,
    slidesUrl: lecture.slidesUrl,
    codeUrl: lecture.codeUrl,
    status: lectureProgress?.status ?? null,
    manual: lectureProgress?.manual ?? false,
    requirements,
    complete: lectureProgress?.status === "completed",
    unlocked: lectureLock.unlocked,
    lockedByTitle: lectureLock.lockedByTitle,
    noteBody: note?.body ?? "",
    positionSeconds: playback?.positionSeconds ?? 0,
    course: {
      id: lecture.course.id,
      title: lecture.course.title,
      unlocked: courseLock.unlocked,
      lockedByTitle: courseLock.lockedByTitle,
    },
    previous: previous
      ? { id: previous.id, number: previous.number, title: previous.title }
      : null,
    next: next ? { id: next.id, number: next.number, title: next.title } : null,
    finger: finger
      ? {
          id: finger.id,
          title: finger.title,
          summary: finger.summary,
          url: finger.url,
          solutionsUrl: finger.solutionsUrl,
          done: progress.some(
            (item) => item.targetId === finger.id && item.status === "completed",
          ),
        }
      : null,
    due: due.map((assignment) => ({
      id: assignment.id,
      code: assignment.code,
      title: assignment.title,
      summary: assignment.summary,
      url: assignment.url,
      codeUrl: assignment.codeUrl,
      graded: assignment.graded,
      done: progress.some(
        (item) => item.targetId === assignment.id && item.status === "completed",
      ),
    })),
    questions: lecture.questions.map((question) => {
      const answer = answerByQuestion.get(question.id);
      return {
        id: question.id,
        order: question.order,
        kind: question.kind,
        prompt: question.prompt,
        answer: answer
          ? {
              id: answer.id,
              body: answer.body,
              updatedAt: answer.updatedAt.toISOString(),
              feedback: answer.feedback
                ? {
                    body: answer.feedback.body,
                    updatedAt: answer.feedback.updatedAt.toISOString(),
                  }
                : null,
            }
          : null,
      };
    }),
  };
}

export async function saveLectureNote(user: SessionUser, lectureId: string, body: string) {
  const lecture = await prisma.lecture.findUnique({ where: { id: lectureId } });
  if (!lecture) throw new ApiError(404, "Lecture not found.");
  if (!isTutor(user)) {
    const courses = await loadCourses();
    const state = await learnerState(user.id);
    const answered = answeredByLecture(courses, state.answers);
    const checkpoints = courses.map(toCheckpoint);
    const courseLock = courseIsUnlocked(lecture.courseId, checkpoints, state.progress, answered);
    if (!courseLock.unlocked) {
      throw new ApiError(403, `Finish ${courseLock.lockedByTitle} first.`);
    }
    const checkpoint = checkpoints.find((item) => item.id === lecture.courseId);
    if (checkpoint) {
      const lectureLock = lectureIsUnlocked(
        checkpoint,
        lecture.id,
        state.progress,
        answered,
      );
      if (!lectureLock.unlocked) {
        throw new ApiError(403, `Finish ${lectureLock.lockedByTitle} first.`);
      }
    }
  }
  const note = await prisma.lectureNote.upsert({
    where: { userId_lectureId: { userId: user.id, lectureId } },
    update: { body },
    create: { userId: user.id, lectureId, body },
  });
  await recordStudy(user.id);
  return {
    lectureId: note.lectureId,
    body: note.body,
    updatedAt: note.updatedAt.toISOString(),
  };
}

export async function savePlayback(
  user: SessionUser,
  lectureId: string,
  positionSeconds: number,
) {
  const lecture = await prisma.lecture.findUnique({ where: { id: lectureId } });
  if (!lecture) throw new ApiError(404, "Lecture not found.");
  if (!isTutor(user)) {
    const courses = await loadCourses();
    const state = await learnerState(user.id);
    const answered = answeredByLecture(courses, state.answers);
    const checkpoints = courses.map(toCheckpoint);
    const courseLock = courseIsUnlocked(lecture.courseId, checkpoints, state.progress, answered);
    if (!courseLock.unlocked) {
      throw new ApiError(403, `Finish ${courseLock.lockedByTitle} first.`);
    }
    const checkpoint = checkpoints.find((item) => item.id === lecture.courseId);
    if (checkpoint) {
      const lectureLock = lectureIsUnlocked(
        checkpoint,
        lecture.id,
        state.progress,
        answered,
      );
      if (!lectureLock.unlocked) {
        throw new ApiError(403, `Finish ${lectureLock.lockedByTitle} first.`);
      }
    }
  }
  const seconds = Math.max(0, Math.floor(positionSeconds));
  const playback = await prisma.playback.upsert({
    where: { userId_lectureId: { userId: user.id, lectureId } },
    update: { positionSeconds: seconds },
    create: { userId: user.id, lectureId, positionSeconds: seconds },
  });
  return {
    lectureId: playback.lectureId,
    positionSeconds: playback.positionSeconds,
    updatedAt: playback.updatedAt.toISOString(),
  };
}

export async function getReviewQueue(filter: "open" | "all") {
  const answers = await prisma.answer.findMany({
    where: filter === "open" ? { feedback: null } : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      feedback: true,
      question: {
        include: { lecture: { include: { course: true } } },
      },
    },
  });

  return answers.map((answer) => ({
    id: answer.id,
    body: answer.body,
    updatedAt: answer.updatedAt.toISOString(),
    learner: answer.user.name,
    prompt: answer.question.prompt,
    kind: answer.question.kind,
    lecture: {
      id: answer.question.lecture.id,
      number: answer.question.lecture.number,
      title: answer.question.lecture.title,
    },
    course: {
      id: answer.question.lecture.course.id,
      title: answer.question.lecture.course.title,
    },
    feedback: answer.feedback
      ? { body: answer.feedback.body, updatedAt: answer.feedback.updatedAt.toISOString() }
      : null,
  }));
}

export type DashboardData = Awaited<ReturnType<typeof getDashboard>>;
export type { CurrentItem };
