import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProgressToggle } from "@/components/progress-toggle";
import { Badge } from "@/components/ui/badge";
import { ApiError } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { getCourse } from "@/lib/study";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: slug };
}

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

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { slug } = await params;
  let course;
  try {
    course = await getCourse(session, slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const problemSets = course.assignments.filter((item) => item.kind === "problem_set");
  const other = course.assignments.filter(
    (item) => item.kind !== "problem_set" && item.kind !== "finger",
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
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
        </div>
        <p className="mt-3 text-sm">
          <span className="text-muted-foreground">Prerequisites: </span>
          {course.prerequisites}
        </p>
        {course.notes ? (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{course.notes}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          <External href={course.url}>Course site</External>
          {course.altUrl ? <External href={course.altUrl}>Alternative</External> : null}
          {course.guideUrl ? <External href={course.guideUrl}>OSSU guide</External> : null}
          {course.discussionUrl ? <External href={course.discussionUrl}>Discussion</External> : null}
          {course.playlistUrl ? <External href={course.playlistUrl}>Playlist</External> : null}
        </div>
      </div>

      {course.videoTodo && course.lectures.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d7a15e] bg-[#fff7ea] p-4 text-sm leading-relaxed">
          <p className="font-medium text-[#9c4a32]">Lecture videos are not filled in</p>
          <p className="mt-1 text-muted-foreground">{course.videoTodo}</p>
        </div>
      ) : null}

      {!course.hasLecturePlan ? (
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <h2 className="text-xl">Mark the course</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This course has no lecture rows yet. Completing it counts the whole estimated block
            toward the required track, if it is a required course.
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
      ) : null}

      {course.lectures.length > 0 ? (
        <ol className="flex flex-col gap-3">
          {course.lectures.map((lecture) => {
            const gates = problemSets.filter(
              (item) => item.dueBeforeLectureNumber === lecture.number,
            );
            return (
              <li key={lecture.id} className="flex flex-col gap-2">
                {gates.map((gate) => (
                  <div
                    key={gate.id}
                    id={gate.id}
                    className="scroll-mt-28 rounded-2xl border border-[#e7c7a2] bg-[#fff7ea] p-4"
                  >
                    <p className="text-xs tracking-[0.14em] text-[#9c4a32] uppercase">
                      Due before lecture {lecture.number}
                      {gate.graded ? "" : " · ungraded"}
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
                        label="Mark done"
                        doneLabel="Done · undo"
                        variant="outline"
                      />
                    </div>
                  </div>
                ))}
                <div className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Lecture {lecture.number}
                        {lecture.pathState === "done"
                          ? " · Done"
                          : lecture.pathState === "current"
                            ? " · Current"
                            : " · Later"}
                      </p>
                      <Link href={`/lectures/${lecture.id}`} className="text-lg hover:underline">
                        {lecture.title}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">{lecture.summary}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {lecture.duration ? `${lecture.duration} · ` : ""}
                        {lecture.hasVideo ? "Video ready" : "No verified video"}
                        {lecture.questionCount > 0 ? ` · ${lecture.questionCount} checks` : ""}
                        {lecture.finger ? ` · finger exercise ${lecture.finger.done ? "done" : "open"}` : ""}
                        {lecture.status === "completed"
                          ? " · complete"
                          : lecture.status === "watched"
                            ? " · watched"
                            : ""}
                      </p>
                    </div>
                    <Link
                      href={`/lectures/${lecture.id}`}
                      className="inline-flex h-8 items-center rounded-lg bg-secondary px-3 text-sm"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}

      {other.length > 0 ? (
        <section>
          <h2 className="text-xl">Other work</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {other.map((assignment) => (
              <li key={assignment.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
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
  );
}
