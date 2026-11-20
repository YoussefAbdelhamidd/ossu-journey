import { essenceLinearAlgebra } from "./essence-linear-algebra";
import { mit6100l } from "./mit-6100l";
import { sections } from "./curriculum";
import type { CourseDetail } from "./types";

export { sections };

/**
 * Register a course's lectures here after you add a file next to this one.
 *
 * Shape: CourseDetail in ./types.ts
 * - youtubeId is optional. Leave it unset and set videoTodo when you have
 *   not verified the ID from the official playlist or course page.
 * - questions are optional. 6.100L is the course that has them.
 * Stable IDs are derived in prisma/seed.ts from courseId + lecture number,
 * so re-seeding updates text without wiping answers.
 */
export const courseDetails: CourseDetail[] = [
  mit6100l,
  essenceLinearAlgebra,
];
