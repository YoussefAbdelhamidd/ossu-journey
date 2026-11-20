"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnswerForm } from "@/components/answer-form";
import { CertificateCard } from "@/components/certificate-card";
import { LectureNotes } from "@/components/lecture-notes";
import { ProgressToggle } from "@/components/progress-toggle";
import { ReadingShelf } from "@/components/reading-shelf";
import { YoutubePlayer } from "@/components/youtube-player";
import { Badge } from "@/components/ui/badge";

export type CourseDeskLecture = {
  id: string;
  number: number;
  title: string;
  summary: string;
  readings: string | null;
  youtubeId: string | null;
  videoTodo: string | null;
  duration: string | null;
  pageUrl: string | null;
  slidesUrl: string | null;
  codeUrl: string | null;
  hasVideo: boolean;
  questionCount: number;
  status: string | null;
  manual: boolean;
  complete: boolean;
  requirements: string[];
  unlocked: boolean;
  lockedByTitle: string | null;
  pathState: "done" | "current" | "upcoming" | "locked";
  noteBody: string;
  positionSeconds: number;
  finger: {
    id: string;
    title: string;
    summary: string;
    url: string | null;
    solutionsUrl: string | null;
    done: boolean;
  } | null;
  questions: {
    id: string;
    order: number;
    kind: string;
    prompt: string;
    answer: {
      id: string;
      body: string;
      updatedAt: string;
      feedback: { body: string; updatedAt: string } | null;
    } | null;
  }[];
};

export type CourseDeskData = {
  id: string;
  title: string;
  provider: string | null;
  instructor: string | null;
  url: string;
  altUrl: string | null;
  guideUrl: string | null;
  discussionUrl: string | null;
  playlistUrl: string | null;
  effort: string | null;
  prerequisites: string;
  notes: string | null;
  required: boolean;
  choiceGroup: string | null;
  videoTodo: string | null;
  coverImage: string | null;
  offersCertificate: boolean;
  certificateLabel: string | null;
  sectionTitle: string;
  subsectionTitle: string;
  percent: number;
  courseCompleted: boolean;
  hasLecturePlan: boolean;
  unlocked: boolean;
  lockedByTitle: string | null;
  lectures: CourseDeskLecture[];
  readings: {
    id: string;
    title: string;
    author: string | null;
    kind: string;
    url: string;
    summary: string | null;
  }[];
  assignments: {
    id: string;
    kind: string;
    code: string;
    title: string;
    summary: string;
    url: string | null;
    codeUrl: string | null;
    solutionsUrl: string | null;
    lectureNumber: number | null;
    dueBeforeLectureNumber: number | null;
    graded: boolean;
    done: boolean;
  }[];
};

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-sm text-[#0e6b66] underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}

export function CourseDesk({
  course,
  selectedLectureId,
}: {
  course: CourseDeskData;
  selectedLectureId: string | null;
}) {
  const router = useRouter();
  const problemSets = course.assignments.filter((item) => item.kind === "problem_set");
  const other = course.assignments.filter(
    (item) => item.kind !== "problem_set" && item.kind !== "finger",
  );

  const active = useMemo(() => {
    if (!course.unlocked) return null;
    if (selectedLectureId) {
      const match = course.lectures.find((item) => item.id === selectedLectureId);
      if (match?.unlocked) return match;
    }
    const current = course.lectures.find((item) => item.pathState === "current");
    if (current) return current;
    return course.lectures.find((item) => item.unlocked) ?? null;
  }, [course, selectedLectureId]);

  function selectLecture(lectureId: string) {
    router.push(`/courses/${course.id}?lecture=${lectureId}`, { scroll: false });
  }

  const dueForActive = active
    ? problemSets.filter((item) => item.dueBeforeLectureNumber === active.number)
    : [];

  // Problem sets that unlock the next lecture after the current one is finished.
  // Without this, PS0 (due before lecture 2) never shows a Mark done control while
  // lecture 1 is still selected.
  const blockingGates = useMemo(() => {
    if (!course.unlocked || !active) return [];
    const nextLocked = course.lectures.find(
      (lecture) => lecture.number > active.number && !lecture.unlocked,
    );
    if (!nextLocked) return [];
    return problemSets.filter(
      (item) =>
        !item.done &&
        item.dueBeforeLectureNumber != null &&
        item.dueBeforeLectureNumber > active.number &&
        item.dueBeforeLectureNumber <= nextLocked.number,
    );
  }, [course.unlocked, course.lectures, active, problemSets]);

  const gatesToShow = (() => {
    const seen = new Set<string>();
    const list = [...blockingGates, ...dueForActive];
    return list.filter((gate) => {
      if (seen.has(gate.id)) return false;
      seen.add(gate.id);
      return true;
    });
  })();

  return (
    <div className="flex flex-col gap-6">
      <header className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
          <div className="relative min-h-44 bg-[#0a3f3d]">
            {course.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={course.coverImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-end p-5 text-[#f6f3ea]">
                <p className="font-sans text-2xl font-semibold">{course.sectionTitle}</p>
              </div>
            )}
          </div>
          <div className="p-5 sm:p-7">
            <p className="text-xs text-muted-foreground">
              <Link href="/curriculum" className="hover:underline">
                {course.sectionTitle}
              </Link>
              {" · "}
              {course.subsectionTitle}
            </p>
            <h1 className="mt-1 text-3xl text-[#0a3f3d] sm:text-4xl">{course.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {course.provider ? <span>{course.provider}</span> : null}
              {course.instructor ? <span>· {course.instructor}</span> : null}
              {course.effort ? <span>· {course.effort}</span> : null}
              <Badge variant="outline">{course.percent}%</Badge>
              {course.required ? null : <Badge variant="secondary">Elective</Badge>}
              {course.choiceGroup ? <Badge variant="secondary">Choose one</Badge> : null}
              {!course.unlocked ? <Badge className="bg-[#9c4a32] text-white">Locked</Badge> : null}
            </div>
            <p className="mt-3 text-sm">
              <span className="text-muted-foreground">Prerequisites: </span>
              {course.prerequisites}
            </p>
            {course.notes ? (
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {course.notes}
              </p>
            ) : null}
            {!course.unlocked && course.lockedByTitle ? (
              <p className="mt-4 rounded-xl bg-[#fff7ea] px-3 py-2 text-sm text-[#9c4a32]">
                Finish <span className="font-medium">{course.lockedByTitle}</span> before this
                course opens.
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              <External href={course.url}>Course site</External>
              {course.altUrl ? <External href={course.altUrl}>Alternative</External> : null}
              {course.guideUrl ? <External href={course.guideUrl}>OSSU guide</External> : null}
              {course.discussionUrl ? (
                <External href={course.discussionUrl}>Discussion</External>
              ) : null}
              {course.playlistUrl ? <External href={course.playlistUrl}>Playlist</External> : null}
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          {course.unlocked && active ? (
            <>
              {gatesToShow.map((gate) => (
                <div
                  key={gate.id}
                  id={gate.id}
                  className="scroll-mt-28 rounded-2xl border border-[#e7c7a2] bg-[#fff7ea] p-4"
                >
                  <p className="text-xs tracking-[0.14em] text-[#9c4a32] uppercase">
                    Due before lecture {gate.dueBeforeLectureNumber}
                    {gate.graded ? "" : " · ungraded"}
                    {!gate.done ? " · required to unlock the next lecture" : ""}
                  </p>
                  <h2 className="mt-1 text-lg">
                    {gate.code}: {gate.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{gate.summary}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {gate.url ? <External href={gate.url}>Problem set</External> : null}
                    {gate.codeUrl ? <External href={gate.codeUrl}>Starter code</External> : null}
                    <ProgressToggle
                      targetType="assignment"
                      targetId={gate.id}
                      action="completed"
                      done={gate.done}
                      label={`Mark ${gate.code} done`}
                      doneLabel={`${gate.code} done · undo`}
                      variant="outline"
                    />
                  </div>
                </div>
              ))}

              <div>
                <p className="mb-2 text-xs text-muted-foreground">
                  Lecture {active.number}
                  {active.pathState === "done"
                    ? " · Done"
                    : active.pathState === "current"
                      ? " · Current"
                      : ""}
                </p>
                <h2 className="text-2xl text-[#0a3f3d]">{active.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {active.summary}
                </p>
              </div>

              {active.youtubeId ? (
                <YoutubePlayer
                  key={active.id}
                  lectureId={active.id}
                  youtubeId={active.youtubeId}
                  title={`Lecture ${active.number}: ${active.title}`}
                  startSeconds={active.positionSeconds}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d7a15e] bg-[#fff7ea] p-4 text-sm">
                  <p className="font-medium text-[#9c4a32]">No verified video for this lecture</p>
                  <p className="mt-1 text-muted-foreground">
                    {active.videoTodo ??
                      "TODO: add a YouTube ID only after checking it against the official playlist."}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {active.pageUrl ? <External href={active.pageUrl}>Lecture page</External> : null}
                {active.slidesUrl ? <External href={active.slidesUrl}>Slides</External> : null}
                {active.codeUrl ? <External href={active.codeUrl}>Code</External> : null}
              </div>

              <LectureNotes lectureId={active.id} initialBody={active.noteBody} />

              <section className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                <h2 className="text-xl">Progress</h2>
                {active.requirements.length > 0 ? (
                  <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                    {active.requirements.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Everything for this lecture is checked off.
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <ProgressToggle
                    targetType="lecture"
                    targetId={active.id}
                    action="watched"
                    done={active.status === "watched" || active.status === "completed"}
                    label="Mark video watched"
                    doneLabel="Watched · undo"
                    variant="outline"
                  />
                  <ProgressToggle
                    targetType="lecture"
                    targetId={active.id}
                    action="completed"
                    done={active.complete && active.manual}
                    label="Mark complete anyway"
                    doneLabel="Manually complete · undo"
                    variant="secondary"
                  />
                </div>
              </section>

              {active.finger ? (
                <section
                  id="finger"
                  className="scroll-mt-28 rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
                >
                  <h2 className="text-xl">{active.finger.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {active.finger.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {active.finger.url ? (
                      <External href={active.finger.url}>Official prompt</External>
                    ) : null}
                    {active.finger.solutionsUrl ? (
                      <External href={active.finger.solutionsUrl}>Self-check on OCW</External>
                    ) : null}
                    <ProgressToggle
                      targetType="assignment"
                      targetId={active.finger.id}
                      action="completed"
                      done={active.finger.done}
                      label="Mark finger exercise done"
                      doneLabel="Finger exercise done · undo"
                      variant="outline"
                    />
                  </div>
                </section>
              ) : null}

              {active.questions.length > 0 ? (
                <section id="checks" className="scroll-mt-28 flex flex-col gap-4">
                  <div>
                    <h2 className="text-2xl">Understanding checks</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Write your own answer. Model answers are not stored or shown.
                    </p>
                  </div>
                  {active.questions.map((question) => (
                    <div
                      key={question.id}
                      className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {question.kind === "practice" ? "Practice" : "Concept"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Question {question.order}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                        {question.prompt}
                      </p>
                      <div className="mt-3">
                        <AnswerForm
                          questionId={question.id}
                          initialBody={question.answer?.body ?? ""}
                        />
                      </div>
                      {question.answer?.feedback ? (
                        <div className="mt-4 rounded-xl bg-[#e7f3f1] p-3">
                          <p className="text-xs tracking-[0.14em] text-[#0e6b66] uppercase">
                            Tutor note
                          </p>
                          <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                            {question.answer.feedback.body}
                          </p>
                        </div>
                      ) : question.answer ? (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Saved. Waiting on your tutor.
                        </p>
                      ) : null}
                    </div>
                  ))}
                </section>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No understanding-check questions for this lecture yet.
                </p>
              )}
            </>
          ) : course.unlocked && course.videoTodo && course.lectures.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d7a15e] bg-[#fff7ea] p-4 text-sm leading-relaxed">
              <p className="font-medium text-[#9c4a32]">Lecture videos are not filled in</p>
              <p className="mt-1 text-muted-foreground">{course.videoTodo}</p>
            </div>
          ) : course.unlocked && !course.hasLecturePlan ? (
            <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
              <h2 className="text-xl">Mark the course</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This course has no lecture rows yet. Completing it counts the whole estimated
                block toward the required track, if it is a required course.
              </p>
              <div className="mt-4">
                <ProgressToggle
                  targetType="course"
                  targetId={course.id}
                  action="completed"
                  done={course.courseCompleted}
                  label="Mark course complete"
                  doneLabel="Completed · undo"
                />
              </div>
            </div>
          ) : !course.unlocked ? (
            <div className="rounded-2xl border border-dashed border-[#d7a15e] bg-[#fff7ea] p-5 text-sm">
              <p className="font-medium text-[#9c4a32]">Course locked</p>
              <p className="mt-2 text-muted-foreground">
                The player stays closed until you finish{" "}
                <span className="font-medium text-[#9c4a32]">
                  {course.lockedByTitle ?? "the previous course"}
                </span>
                . Readings and certificate previews below stay visible for motivation.
              </p>
            </div>
          ) : null}

          <ReadingShelf readings={course.readings} />

          {course.offersCertificate && course.certificateLabel ? (
            <CertificateCard
              courseTitle={course.title}
              provider={course.provider}
              label={course.certificateLabel}
              courseUrl={course.url}
            />
          ) : null}

          {course.unlocked && other.length > 0 ? (
            <section>
              <h2 className="text-xl">Other work</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {other.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
                  >
                    <h3 className="text-lg">{assignment.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{assignment.summary}</p>
                    <div className="mt-3">
                      <ProgressToggle
                        targetType="assignment"
                        targetId={assignment.id}
                        action="completed"
                        done={assignment.done}
                        label="Mark done"
                        doneLabel="Done · undo"
                        variant="outline"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-lg text-[#0a3f3d]">Curriculum</h2>
              <p className="text-xs tabular-nums text-muted-foreground">{course.percent}%</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7dccb]">
              <div
                className="h-full rounded-full bg-[#0e6b66]"
                style={{ width: `${Math.min(100, course.percent)}%` }}
              />
            </div>
            {course.lectures.length > 0 ? (
              <ol className="mt-4 max-h-[70vh] space-y-1 overflow-y-auto pr-1">
                {course.lectures.map((lecture) => {
                  const gates = problemSets.filter(
                    (item) => item.dueBeforeLectureNumber === lecture.number,
                  );
                  const selected = active?.id === lecture.id;
                  const locked = !course.unlocked || !lecture.unlocked;
                  return (
                    <li key={lecture.id} className="flex flex-col gap-1">
                      {gates.map((gate) => (
                        <a
                          key={gate.id}
                          href={`#${gate.id}`}
                          className="block rounded-lg border border-[#e7c7a2] bg-[#fff7ea] px-2.5 py-2 text-xs hover:ring-1 hover:ring-[#d7a15e]"
                        >
                          <p className="font-medium text-[#9c4a32]">
                            {gate.code}
                            {gate.done ? " · done" : " · due · tap to mark"}
                          </p>
                          <p className="text-muted-foreground">{gate.title}</p>
                        </a>
                      ))}
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => selectLecture(lecture.id)}
                        className={`w-full rounded-lg px-2.5 py-2 text-left text-sm transition ${
                          selected
                            ? "bg-[#0e6b66] text-[#f6f3ea]"
                            : locked
                              ? "cursor-not-allowed bg-[#efe6d6]/60 text-[#8a8174]"
                              : lecture.pathState === "done"
                                ? "bg-[#e7f3f1] text-[#0a3f3d] hover:bg-[#d7ebe6]"
                                : "bg-[#fffaf3] text-[#1e1a14] hover:bg-[#efe6d6]"
                        }`}
                      >
                        <span className="block text-xs opacity-80">
                          Lecture {lecture.number}
                          {locked
                            ? " · Locked"
                            : lecture.pathState === "done"
                              ? " · Done"
                              : lecture.pathState === "current"
                                ? " · Current"
                                : ""}
                        </span>
                        <span className="mt-0.5 block font-medium">{lecture.title}</span>
                        {locked && lecture.lockedByTitle ? (
                          <span className="mt-0.5 block text-xs opacity-70">
                            After {lecture.lockedByTitle}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No lecture list yet. Track this course as a whole when it unlocks.
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Later lectures stay closed until the current one is finished.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
