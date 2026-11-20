export type QuestionSeed = {
  kind: "conceptual" | "practice";
  prompt: string;
};

export type LectureSeed = {
  number: number;
  title: string;
  summary: string;
  readings?: string;
  youtubeId?: string;
  videoTodo?: string;
  durationSeconds?: number;
  pageUrl?: string;
  slidesUrl?: string;
  codeUrl?: string;
  questions?: QuestionSeed[];
};

export type AssignmentSeed = {
  kind: "finger" | "problem_set" | "homework" | "project" | "lab";
  code: string;
  title: string;
  summary: string;
  url?: string;
  codeUrl?: string;
  solutionsUrl?: string;
  lectureNumber?: number;
  dueBeforeLectureNumber?: number;
  releasedAtLectureNumber?: number;
  graded?: boolean;
};

export type CourseDetail = {
  courseId: string;
  lectures: LectureSeed[];
  assignments?: AssignmentSeed[];
};

export type CourseSeed = {
  id: string;
  title: string;
  provider?: string;
  instructor?: string;
  url: string;
  altUrl?: string;
  guideUrl?: string;
  discussionUrl?: string;
  playlistUrl?: string;
  durationWeeks?: number;
  durationLabel?: string;
  hoursPerWeekMin?: number;
  hoursPerWeekMax?: number;
  prerequisites: string;
  notes?: string;
  required?: boolean;
  choiceGroup?: string;
  videoTodo?: string;
};

export type SubsectionSeed = {
  id: string;
  title: string;
  summary: string;
  topics: string[];
  courses: CourseSeed[];
};

export type SectionSeed = {
  id: string;
  title: string;
  summary: string;
  subsections: SubsectionSeed[];
};

export const VIDEO_TODO =
  "TODO: lecture videos are not seeded. Add a CourseDetail in prisma/seed-data/ and register it in prisma/seed-data/index.ts. Only include YouTube IDs verified from the official playlist or course page. Do not invent IDs.";

export function estimatedHours(course: {
  durationWeeks?: number;
  hoursPerWeekMin?: number;
  hoursPerWeekMax?: number;
}): number | null {
  const weeks = course.durationWeeks;
  const min = course.hoursPerWeekMin;
  const max = course.hoursPerWeekMax;
  if (weeks == null || min == null || max == null) return null;
  return Math.round(weeks * ((min + max) / 2) * 10) / 10;
}
