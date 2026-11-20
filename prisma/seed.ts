import { existsSync, readFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { courseDetails, sections } from "./seed-data";
import { estimatedHours } from "./seed-data/types";

loadEnvFile();

const prisma = new PrismaClient();

function loadEnvFile() {
  if (!existsSync(".env")) return;
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function isLocalDatabase() {
  const url = process.env.DATABASE_URL ?? "";
  return /@(localhost|127\.0\.0\.1)(:|\/)/.test(url);
}

function envOrDev(name: string, devFallback: string) {
  const value = process.env[name];
  if (value) return value;
  if (!isLocalDatabase()) {
    throw new Error(
      `${name} must be set when seeding a non-local database. Refusing built-in account values.`,
    );
  }
  return devFallback;
}

function lectureId(courseId: string, number: number) {
  return `lec-${courseId}-${number}`;
}

function questionId(courseId: string, lectureNumber: number, order: number) {
  return `q-${courseId}-${lectureNumber}-${order}`;
}

function assignmentId(courseId: string, code: string) {
  return `as-${courseId}-${code.toLowerCase()}`;
}

async function main() {
  const learnerEmail = envOrDev("LEARNER_EMAIL", "momen@ossu.local");
  const learnerPassword = envOrDev("LEARNER_PASSWORD", "study-at-dawn");
  const learnerName = envOrDev("LEARNER_NAME", "Momen");
  const tutorEmail = envOrDev("TUTOR_EMAIL", "tutor@ossu.local");
  const tutorPassword = envOrDev("TUTOR_PASSWORD", "review-desk");
  const tutorName = envOrDev("TUTOR_NAME", "Tutor");

  const learnerHash = await bcrypt.hash(learnerPassword, 10);
  const tutorHash = await bcrypt.hash(tutorPassword, 10);

  await prisma.user.upsert({
    where: { email: learnerEmail },
    update: {
      name: learnerName,
      passwordHash: learnerHash,
      role: "LEARNER",
      timezone: "Africa/Cairo",
    },
    create: {
      email: learnerEmail,
      name: learnerName,
      passwordHash: learnerHash,
      role: "LEARNER",
      timezone: "Africa/Cairo",
    },
  });

  await prisma.user.upsert({
    where: { email: tutorEmail },
    update: {
      name: tutorName,
      passwordHash: tutorHash,
      role: "TUTOR",
      timezone: "Africa/Cairo",
    },
    create: {
      email: tutorEmail,
      name: tutorName,
      passwordHash: tutorHash,
      role: "TUTOR",
      timezone: "Africa/Cairo",
    },
  });

  const details = new Map(courseDetails.map((detail) => [detail.courseId, detail]));

  await prisma.$transaction(
    async (tx) => {
      for (const [sectionIndex, section] of sections.entries()) {
        await tx.section.upsert({
          where: { id: section.id },
          update: {
            title: section.title,
            summary: section.summary,
            order: sectionIndex,
          },
          create: {
            id: section.id,
            title: section.title,
            summary: section.summary,
            order: sectionIndex,
          },
        });

        for (const [subsectionIndex, subsection] of section.subsections.entries()) {
          await tx.subsection.upsert({
            where: { id: subsection.id },
            update: {
              sectionId: section.id,
              title: subsection.title,
              summary: subsection.summary,
              topics: JSON.stringify(subsection.topics),
              order: subsectionIndex,
            },
            create: {
              id: subsection.id,
              sectionId: section.id,
              title: subsection.title,
              summary: subsection.summary,
              topics: JSON.stringify(subsection.topics),
              order: subsectionIndex,
            },
          });

          for (const [courseIndex, course] of subsection.courses.entries()) {
            const hours = estimatedHours(course);
            await tx.course.upsert({
              where: { id: course.id },
              update: {
                subsectionId: subsection.id,
                title: course.title,
                provider: course.provider ?? null,
                instructor: course.instructor ?? null,
                url: course.url,
                altUrl: course.altUrl ?? null,
                guideUrl: course.guideUrl ?? null,
                discussionUrl: course.discussionUrl ?? null,
                playlistUrl: course.playlistUrl ?? null,
                durationWeeks: course.durationWeeks ?? null,
                durationLabel: course.durationLabel ?? null,
                hoursPerWeekMin: course.hoursPerWeekMin ?? null,
                hoursPerWeekMax: course.hoursPerWeekMax ?? null,
                estimatedHours: hours,
                prerequisites: course.prerequisites,
                notes: course.notes ?? null,
                required: course.required ?? true,
                choiceGroup: course.choiceGroup ?? null,
                videoTodo: course.videoTodo ?? null,
                order: courseIndex,
              },
              create: {
                id: course.id,
                subsectionId: subsection.id,
                title: course.title,
                provider: course.provider ?? null,
                instructor: course.instructor ?? null,
                url: course.url,
                altUrl: course.altUrl ?? null,
                guideUrl: course.guideUrl ?? null,
                discussionUrl: course.discussionUrl ?? null,
                playlistUrl: course.playlistUrl ?? null,
                durationWeeks: course.durationWeeks ?? null,
                durationLabel: course.durationLabel ?? null,
                hoursPerWeekMin: course.hoursPerWeekMin ?? null,
                hoursPerWeekMax: course.hoursPerWeekMax ?? null,
                estimatedHours: hours,
                prerequisites: course.prerequisites,
                notes: course.notes ?? null,
                required: course.required ?? true,
                choiceGroup: course.choiceGroup ?? null,
                videoTodo: course.videoTodo ?? null,
                order: courseIndex,
              },
            });

            const detail = details.get(course.id);
            if (!detail) continue;

            for (const [lectureIndex, lecture] of detail.lectures.entries()) {
              const id = lectureId(course.id, lecture.number);
              await tx.lecture.upsert({
                where: { id },
                update: {
                  courseId: course.id,
                  number: lecture.number,
                  title: lecture.title,
                  summary: lecture.summary,
                  readings: lecture.readings ?? null,
                  youtubeId: lecture.youtubeId ?? null,
                  videoTodo: lecture.videoTodo ?? null,
                  durationSeconds: lecture.durationSeconds ?? null,
                  pageUrl: lecture.pageUrl ?? null,
                  slidesUrl: lecture.slidesUrl ?? null,
                  codeUrl: lecture.codeUrl ?? null,
                  order: lectureIndex,
                },
                create: {
                  id,
                  courseId: course.id,
                  number: lecture.number,
                  title: lecture.title,
                  summary: lecture.summary,
                  readings: lecture.readings ?? null,
                  youtubeId: lecture.youtubeId ?? null,
                  videoTodo: lecture.videoTodo ?? null,
                  durationSeconds: lecture.durationSeconds ?? null,
                  pageUrl: lecture.pageUrl ?? null,
                  slidesUrl: lecture.slidesUrl ?? null,
                  codeUrl: lecture.codeUrl ?? null,
                  order: lectureIndex,
                },
              });

              for (const [questionIndex, question] of (lecture.questions ?? []).entries()) {
                const order = questionIndex + 1;
                const qid = questionId(course.id, lecture.number, order);
                await tx.question.upsert({
                  where: { id: qid },
                  update: {
                    lectureId: id,
                    order,
                    kind: question.kind,
                    prompt: question.prompt,
                  },
                  create: {
                    id: qid,
                    lectureId: id,
                    order,
                    kind: question.kind,
                    prompt: question.prompt,
                  },
                });
              }
            }

            for (const [assignmentIndex, assignment] of (
              detail.assignments ?? []
            ).entries()) {
              const id = assignmentId(course.id, assignment.code);
              await tx.assignment.upsert({
                where: { id },
                update: {
                  courseId: course.id,
                  kind: assignment.kind,
                  code: assignment.code,
                  title: assignment.title,
                  summary: assignment.summary,
                  url: assignment.url ?? null,
                  codeUrl: assignment.codeUrl ?? null,
                  solutionsUrl: assignment.solutionsUrl ?? null,
                  lectureNumber: assignment.lectureNumber ?? null,
                  dueBeforeLectureNumber: assignment.dueBeforeLectureNumber ?? null,
                  releasedAtLectureNumber: assignment.releasedAtLectureNumber ?? null,
                  graded: assignment.graded ?? true,
                  order: assignmentIndex,
                },
                create: {
                  id,
                  courseId: course.id,
                  kind: assignment.kind,
                  code: assignment.code,
                  title: assignment.title,
                  summary: assignment.summary,
                  url: assignment.url ?? null,
                  codeUrl: assignment.codeUrl ?? null,
                  solutionsUrl: assignment.solutionsUrl ?? null,
                  lectureNumber: assignment.lectureNumber ?? null,
                  dueBeforeLectureNumber: assignment.dueBeforeLectureNumber ?? null,
                  releasedAtLectureNumber: assignment.releasedAtLectureNumber ?? null,
                  graded: assignment.graded ?? true,
                  order: assignmentIndex,
                },
              });
            }
          }
        }
      }
    },
    { timeout: 120_000 },
  );

  const [courseCount, lectureCount, questionCount, assignmentCount] = await Promise.all([
    prisma.course.count(),
    prisma.lecture.count(),
    prisma.question.count(),
    prisma.assignment.count(),
  ]);

  console.log(
    `Seeded ${courseCount} courses, ${lectureCount} lectures, ${questionCount} questions, ${assignmentCount} assignments.`,
  );
  console.log(`Learner: ${learnerEmail}`);
  console.log(`Tutor:   ${tutorEmail}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
