export type ProgressRow = {
  targetType: string;
  targetId: string;
  status: string;
  manual?: boolean;
};

export type LectureCheckpoint = {
  id: string;
  number: number;
  title: string;
  questionCount: number;
  fingerAssignmentId: string | null;
};

export type AssignmentCheckpoint = {
  id: string;
  kind: string;
  code: string;
  title: string;
  lectureNumber: number | null;
  dueBeforeLectureNumber: number | null;
};

export type CourseCheckpoint = {
  id: string;
  title: string;
  required: boolean;
  choiceGroup: string | null;
  estimatedHours: number | null;
  sectionId: string;
  sectionTitle: string;
  sectionOrder: number;
  subsectionId: string;
  subsectionTitle: string;
  subsectionOrder: number;
  courseOrder: number;
  lectures: LectureCheckpoint[];
  assignments: AssignmentCheckpoint[];
};

const WATCHED_PARTIAL = 0.4;

export function lectureScore(
  lecture: LectureCheckpoint,
  progress: ProgressRow[],
  answeredCount: number,
  fingerDone: boolean,
): number {
  const row = progress.find(
    (item) => item.targetType === "lecture" && item.targetId === lecture.id,
  );
  const hasRequirements = lecture.questionCount > 0 || lecture.fingerAssignmentId != null;
  const requirementsMet =
    answeredCount >= lecture.questionCount &&
    (lecture.fingerAssignmentId == null || fingerDone);

  if (row?.status === "completed" && (row.manual || requirementsMet || !hasRequirements)) {
    return 1;
  }
  if (row?.manual && row.status === "completed") return 1;
  if (!hasRequirements && (row?.status === "watched" || row?.status === "completed")) {
    return 1;
  }
  if (row?.status === "watched" || row?.status === "completed") {
    return requirementsMet ? 1 : WATCHED_PARTIAL;
  }
  return 0;
}

export function assignmentDone(progress: ProgressRow[], assignmentId: string): boolean {
  return progress.some(
    (item) =>
      item.targetType === "assignment" &&
      item.targetId === assignmentId &&
      item.status === "completed",
  );
}

export function courseFraction(
  course: CourseCheckpoint,
  progress: ProgressRow[],
  answeredByLecture: Map<string, number>,
): number {
  const gradedAssignments = course.assignments.filter((item) => item.kind !== "finger");
  if (course.lectures.length === 0 && gradedAssignments.length === 0) {
    return progress.some(
      (item) =>
        item.targetType === "course" &&
        item.targetId === course.id &&
        item.status === "completed",
    )
      ? 1
      : 0;
  }

  const scores: number[] = [];
  for (const lecture of course.lectures) {
    const fingerDone = lecture.fingerAssignmentId
      ? assignmentDone(progress, lecture.fingerAssignmentId)
      : false;
    scores.push(
      lectureScore(
        lecture,
        progress,
        answeredByLecture.get(lecture.id) ?? 0,
        fingerDone,
      ),
    );
  }
  for (const assignment of gradedAssignments) {
    scores.push(assignmentDone(progress, assignment.id) ? 1 : 0);
  }
  const total = scores.reduce((sum, score) => sum + score, 0);
  return scores.length === 0 ? 0 : total / scores.length;
}

export type TrackSlot = {
  key: string;
  title: string;
  hours: number;
  fraction: number;
  courseIds: string[];
  primaryCourseId: string;
};

export type TrackCourseView = {
  id: string;
  fraction: number;
  hoursCounted: number;
  containsMidpoint: boolean;
};

export type TrackSummary = {
  percent: number;
  completedHours: number;
  totalHours: number;
  midpointHours: number;
  midpointCourseId: string | null;
  slots: TrackSlot[];
  byCourse: Map<string, TrackCourseView>;
};

function byCurriculumOrder(a: CourseCheckpoint, b: CourseCheckpoint): number {
  return (
    a.sectionOrder - b.sectionOrder ||
    a.subsectionOrder - b.subsectionOrder ||
    a.courseOrder - b.courseOrder
  );
}

export function buildSlots(
  courses: CourseCheckpoint[],
  fractionOf: (course: CourseCheckpoint) => number,
): TrackSlot[] {
  const sorted = [...courses].sort(byCurriculumOrder);
  const seenGroups = new Set<string>();
  const slots: TrackSlot[] = [];

  for (const course of sorted) {
    if (course.choiceGroup) {
      if (seenGroups.has(course.choiceGroup)) continue;
      seenGroups.add(course.choiceGroup);
      const members = sorted.filter((item) => item.choiceGroup === course.choiceGroup);
      const hours = Math.max(...members.map((item) => item.estimatedHours ?? 0));
      const fraction = Math.max(...members.map((item) => fractionOf(item)));
      slots.push({
        key: course.choiceGroup,
        title: members.map((item) => item.title).join(" or "),
        hours,
        fraction,
        courseIds: members.map((item) => item.id),
        primaryCourseId: members[0]?.id ?? course.id,
      });
      continue;
    }

    if (!course.required) continue;
    slots.push({
      key: course.id,
      title: course.title,
      hours: course.estimatedHours ?? 0,
      fraction: fractionOf(course),
      courseIds: [course.id],
      primaryCourseId: course.id,
    });
  }

  return slots;
}

export function summarizeTrack(
  courses: CourseCheckpoint[],
  fractionOf: (course: CourseCheckpoint) => number,
): TrackSummary {
  const slots = buildSlots(courses, fractionOf);
  const totalHours = slots.reduce((sum, slot) => sum + slot.hours, 0);
  const completedHours = slots.reduce((sum, slot) => sum + slot.hours * slot.fraction, 0);
  const midpointHours = totalHours / 2;
  let cursor = 0;
  let midpointCourseId: string | null = null;
  const byCourse = new Map<string, TrackCourseView>();

  for (const slot of slots) {
    const next = cursor + slot.hours;
    const contains =
      midpointCourseId == null && totalHours > 0 && cursor < midpointHours && next >= midpointHours;
    if (contains) midpointCourseId = slot.primaryCourseId;
    for (const courseId of slot.courseIds) {
      byCourse.set(courseId, {
        id: courseId,
        fraction: slot.fraction,
        hoursCounted: slot.hours,
        containsMidpoint: contains && courseId === slot.primaryCourseId,
      });
    }
    cursor = next;
  }

  return {
    percent: totalHours === 0 ? 0 : (completedHours / totalHours) * 100,
    completedHours,
    totalHours,
    midpointHours,
    midpointCourseId,
    slots,
    byCourse,
  };
}

export type CurrentItem =
  | {
      kind: "lecture";
      step: "watch" | "finger" | "questions";
      label: string;
      href: string;
      courseId: string;
      courseTitle: string;
      lectureId: string;
      lectureTitle: string;
      lectureNumber: number;
    }
  | {
      kind: "assignment";
      step: "problem_set";
      label: string;
      href: string;
      courseId: string;
      courseTitle: string;
      assignmentId: string;
      title: string;
      code: string;
    }
  | {
      kind: "course";
      step: "course";
      label: string;
      href: string;
      courseId: string;
      courseTitle: string;
    };

function courseFullyDone(
  course: CourseCheckpoint,
  progress: ProgressRow[],
  answeredByLecture: Map<string, number>,
): boolean {
  return courseFraction(course, progress, answeredByLecture) >= 0.999;
}

export function findCurrentItem(
  courses: CourseCheckpoint[],
  progress: ProgressRow[],
  answeredByLecture: Map<string, number>,
): CurrentItem | null {
  const sorted = [...courses].sort(byCurriculumOrder);
  const satisfiedGroups = new Set<string>();

  for (const course of sorted) {
    if (course.choiceGroup) {
      const members = sorted.filter((item) => item.choiceGroup === course.choiceGroup);
      if (members.some((item) => courseFullyDone(item, progress, answeredByLecture))) {
        satisfiedGroups.add(course.choiceGroup);
      }
    }
  }

  for (const course of sorted) {
    const onTrack = course.required || course.choiceGroup != null;
    if (!onTrack) continue;
    if (course.choiceGroup && satisfiedGroups.has(course.choiceGroup)) continue;
    if (course.choiceGroup) {
      const members = sorted.filter((item) => item.choiceGroup === course.choiceGroup);
      const started = members.find(
        (item) => courseFraction(item, progress, answeredByLecture) > 0,
      );
      if (started && started.id !== course.id) continue;
    }

    const problemSets = course.assignments.filter((item) => item.kind === "problem_set");
    for (const lecture of [...course.lectures].sort((a, b) => a.number - b.number)) {
      for (const problemSet of problemSets) {
        if (
          problemSet.dueBeforeLectureNumber === lecture.number &&
          !assignmentDone(progress, problemSet.id)
        ) {
          const before = problemSet.dueBeforeLectureNumber;
          return {
            kind: "assignment",
            step: "problem_set",
            label: `${problemSet.code} is due before lecture ${before}`,
            href: `/courses/${course.id}#${problemSet.id}`,
            courseId: course.id,
            courseTitle: course.title,
            assignmentId: problemSet.id,
            title: problemSet.title,
            code: problemSet.code,
          };
        }
      }

      const fingerDone = lecture.fingerAssignmentId
        ? assignmentDone(progress, lecture.fingerAssignmentId)
        : true;
      const answered = answeredByLecture.get(lecture.id) ?? 0;
      const score = lectureScore(lecture, progress, answered, fingerDone);
      if (score < 0.999) {
        const row = progress.find(
          (item) => item.targetType === "lecture" && item.targetId === lecture.id,
        );
        const watched = row?.status === "watched" || row?.status === "completed";
        const questionsLeft = Math.max(0, lecture.questionCount - answered);
        let step: "watch" | "finger" | "questions" = "watch";
        let label = `Watch lecture ${lecture.number}: ${lecture.title}`;
        let href = `/courses/${course.id}?lecture=${lecture.id}`;
        if (watched && lecture.fingerAssignmentId && !fingerDone) {
          step = "finger";
          label = `Finish the finger exercise for lecture ${lecture.number}`;
          href = `/courses/${course.id}?lecture=${lecture.id}#finger`;
        } else if (watched && questionsLeft > 0) {
          step = "questions";
          label =
            questionsLeft === 1
              ? `Answer 1 understanding check for lecture ${lecture.number}`
              : `Answer ${questionsLeft} understanding checks for lecture ${lecture.number}`;
          href = `/courses/${course.id}?lecture=${lecture.id}#checks`;
        }
        return {
          kind: "lecture",
          step,
          label,
          href,
          courseId: course.id,
          courseTitle: course.title,
          lectureId: lecture.id,
          lectureTitle: lecture.title,
          lectureNumber: lecture.number,
        };
      }
    }

    for (const assignment of course.assignments) {
      if (assignment.kind === "finger") continue;
      if (!assignmentDone(progress, assignment.id)) {
        const alreadyGated = problemSets.some(
          (item) => item.id === assignment.id && item.dueBeforeLectureNumber != null,
        );
        if (alreadyGated) continue;
        return {
          kind: "assignment",
          step: "problem_set",
          label: `Finish ${assignment.code}`,
          href: `/courses/${course.id}#${assignment.id}`,
          courseId: course.id,
          courseTitle: course.title,
          assignmentId: assignment.id,
          title: assignment.title,
          code: assignment.code,
        };
      }
    }

    if (!courseFullyDone(course, progress, answeredByLecture)) {
      return {
        kind: "course",
        step: "course",
        label: `Continue ${course.title}`,
        href: `/courses/${course.id}`,
        courseId: course.id,
        courseTitle: course.title,
      };
    }

    if (course.choiceGroup) satisfiedGroups.add(course.choiceGroup);
  }

  return null;
}

export type WorkTally = {
  lecturesDone: number;
  lecturesTotal: number;
  questionsDone: number;
  questionsTotal: number;
  fingersDone: number;
  fingersTotal: number;
  problemSetsDone: number;
  problemSetsTotal: number;
};

export function tallyWork(
  courses: CourseCheckpoint[],
  progress: ProgressRow[],
  answeredByLecture: Map<string, number>,
): WorkTally {
  const tally: WorkTally = {
    lecturesDone: 0,
    lecturesTotal: 0,
    questionsDone: 0,
    questionsTotal: 0,
    fingersDone: 0,
    fingersTotal: 0,
    problemSetsDone: 0,
    problemSetsTotal: 0,
  };
  for (const course of courses) {
    for (const lecture of course.lectures) {
      tally.lecturesTotal += 1;
      const answered = Math.min(lecture.questionCount, answeredByLecture.get(lecture.id) ?? 0);
      tally.questionsTotal += lecture.questionCount;
      tally.questionsDone += answered;
      const fingerDone = lecture.fingerAssignmentId
        ? assignmentDone(progress, lecture.fingerAssignmentId)
        : false;
      if (lecture.fingerAssignmentId) {
        tally.fingersTotal += 1;
        if (fingerDone) tally.fingersDone += 1;
      }
      if (lectureScore(lecture, progress, answered, fingerDone) >= 0.999) tally.lecturesDone += 1;
    }
    for (const assignment of course.assignments) {
      if (assignment.kind !== "problem_set") continue;
      tally.problemSetsTotal += 1;
      if (assignmentDone(progress, assignment.id)) tally.problemSetsDone += 1;
    }
  }
  return tally;
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatHours(value: number): string {
  const rounded = Math.round(value);
  return `${rounded} h`;
}

export function formatDuration(seconds: number | null | undefined): string | null {
  if (!seconds) return null;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export type LockState = {
  unlocked: boolean;
  lockedByTitle: string | null;
};

export function lectureIsUnlocked(
  course: CourseCheckpoint,
  lectureId: string,
  progress: ProgressRow[],
  answeredByLecture: Map<string, number>,
): LockState {
  const lectures = [...course.lectures].sort((a, b) => a.number - b.number);
  const index = lectures.findIndex((item) => item.id === lectureId);
  if (index < 0) return { unlocked: false, lockedByTitle: course.title };
  if (index === 0) {
    const gates = course.assignments.filter(
      (item) => item.kind === "problem_set" && item.dueBeforeLectureNumber === lectures[0]!.number,
    );
    for (const gate of gates) {
      if (!assignmentDone(progress, gate.id)) {
        return { unlocked: false, lockedByTitle: `${gate.code}: ${gate.title}` };
      }
    }
    return { unlocked: true, lockedByTitle: null };
  }

  const previous = lectures[index - 1]!;
  const fingerDone = previous.fingerAssignmentId
    ? assignmentDone(progress, previous.fingerAssignmentId)
    : true;
  const prevDone =
    lectureScore(previous, progress, answeredByLecture.get(previous.id) ?? 0, fingerDone) >= 0.999;
  if (!prevDone) {
    return {
      unlocked: false,
      lockedByTitle: `Lecture ${previous.number}: ${previous.title}`,
    };
  }

  const current = lectures[index]!;
  const gates = course.assignments.filter(
    (item) => item.kind === "problem_set" && item.dueBeforeLectureNumber === current.number,
  );
  for (const gate of gates) {
    if (!assignmentDone(progress, gate.id)) {
      return { unlocked: false, lockedByTitle: `${gate.code}: ${gate.title}` };
    }
  }

  return { unlocked: true, lockedByTitle: null };
}

export function courseIsUnlocked(
  courseId: string,
  courses: CourseCheckpoint[],
  progress: ProgressRow[],
  answeredByLecture: Map<string, number>,
): LockState {
  const sorted = [...courses].sort(byCurriculumOrder);
  const target = sorted.find((item) => item.id === courseId);
  if (!target) return { unlocked: false, lockedByTitle: null };

  const onRequiredTrack = target.required || target.choiceGroup != null;
  const slots = buildSlots(sorted, (course) =>
    courseFraction(course, progress, answeredByLecture),
  );
  const requiredDone = slots.length > 0 && slots.every((slot) => slot.fraction >= 0.999);

  if (onRequiredTrack) {
    const slotIndex = slots.findIndex((slot) => slot.courseIds.includes(courseId));
    if (slotIndex < 0) return { unlocked: false, lockedByTitle: null };
    if (slotIndex === 0) return { unlocked: true, lockedByTitle: null };
    const previous = slots[slotIndex - 1]!;
    if (previous.fraction >= 0.999) return { unlocked: true, lockedByTitle: null };
    return { unlocked: false, lockedByTitle: previous.title };
  }

  if (!requiredDone) {
    const blocking = slots.find((slot) => slot.fraction < 0.999);
    return {
      unlocked: false,
      lockedByTitle: blocking?.title ?? "the required track",
    };
  }

  const peers = sorted.filter(
    (item) =>
      item.subsectionId === target.subsectionId &&
      !item.required &&
      item.choiceGroup == null,
  );
  const peerIndex = peers.findIndex((item) => item.id === courseId);
  if (peerIndex <= 0) return { unlocked: true, lockedByTitle: null };
  const previousPeer = peers[peerIndex - 1]!;
  if (courseFullyDone(previousPeer, progress, answeredByLecture)) {
    return { unlocked: true, lockedByTitle: null };
  }
  return { unlocked: false, lockedByTitle: previousPeer.title };
}

export function assignmentIsReachable(
  course: CourseCheckpoint,
  assignmentId: string,
  progress: ProgressRow[],
  answeredByLecture: Map<string, number>,
): LockState {
  const assignment = course.assignments.find((item) => item.id === assignmentId);
  if (!assignment) return { unlocked: false, lockedByTitle: course.title };

  if (assignment.kind === "finger" && assignment.lectureNumber != null) {
    const lecture = course.lectures.find((item) => item.number === assignment.lectureNumber);
    if (!lecture) return { unlocked: false, lockedByTitle: course.title };
    return lectureIsUnlocked(course, lecture.id, progress, answeredByLecture);
  }

  if (assignment.dueBeforeLectureNumber != null) {
    const lectures = [...course.lectures].sort((a, b) => a.number - b.number);
    const prior = lectures.filter((item) => item.number < assignment.dueBeforeLectureNumber!);
    if (prior.length === 0) return { unlocked: true, lockedByTitle: null };
    const last = prior[prior.length - 1]!;
    const fingerDone = last.fingerAssignmentId
      ? assignmentDone(progress, last.fingerAssignmentId)
      : true;
    const done =
      lectureScore(last, progress, answeredByLecture.get(last.id) ?? 0, fingerDone) >= 0.999;
    if (!done) {
      return {
        unlocked: false,
        lockedByTitle: `Lecture ${last.number}: ${last.title}`,
      };
    }
    return { unlocked: true, lockedByTitle: null };
  }

  const lectures = [...course.lectures].sort((a, b) => a.number - b.number);
  if (lectures.length === 0) return { unlocked: true, lockedByTitle: null };
  const last = lectures[lectures.length - 1]!;
  return lectureIsUnlocked(course, last.id, progress, answeredByLecture);
}
