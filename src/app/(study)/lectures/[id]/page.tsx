import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AnswerForm } from "@/components/answer-form";
import { ProgressToggle } from "@/components/progress-toggle";
import { Badge } from "@/components/ui/badge";
import { ApiError } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { getLecture } from "@/lib/study";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: id };
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

export default async function LecturePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  let lecture;
  try {
    lecture = await getLecture(session, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <p className="text-xs text-muted-foreground">
          <Link href={`/courses/${lecture.course.id}`} className="hover:underline">
            {lecture.course.title}
          </Link>
        </p>
        <h1 className="mt-1 text-3xl text-[#0a3f3d] sm:text-4xl">
          Lecture {lecture.number}: {lecture.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{lecture.summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {lecture.duration ? <Badge variant="outline">{lecture.duration}</Badge> : null}
          {lecture.complete ? <Badge>Complete</Badge> : lecture.status === "watched" ? <Badge variant="secondary">Watched</Badge> : null}
          {lecture.readings ? <span className="text-muted-foreground">{lecture.readings}</span> : null}
        </div>
      </header>

      {lecture.due.map((assignment) => (
        <section key={assignment.id} className="rounded-2xl border border-[#e7c7a2] bg-[#fff7ea] p-4">
          <p className="text-xs tracking-[0.14em] text-[#9c4a32] uppercase">
            Finish before this lecture{assignment.graded ? "" : " · ungraded"}
          </p>
          <h2 className="mt-1 text-xl">
            {assignment.code}: {assignment.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{assignment.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {assignment.url ? <External href={assignment.url}>Open the PDF</External> : null}
            {assignment.codeUrl ? <External href={assignment.codeUrl}>Starter code</External> : null}
            <ProgressToggle
              targetType="assignment"
              targetId={assignment.id}
              action="completed"
              done={assignment.done}
              label="Mark problem set done"
              doneLabel="Problem set done · undo"
              variant="outline"
            />
          </div>
        </section>
      ))}

      {lecture.youtubeId ? (
        <div id="video" className="scroll-mt-28 overflow-hidden rounded-2xl bg-black ring-1 ring-foreground/10">
          <div className="relative aspect-video">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${lecture.youtubeId}`}
              title={`Lecture ${lecture.number}: ${lecture.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#d7a15e] bg-[#fff7ea] p-4 text-sm">
          <p className="font-medium text-[#9c4a32]">No verified video for this lecture</p>
          <p className="mt-1 text-muted-foreground">
            {lecture.videoTodo ??
              "TODO: add a YouTube ID only after checking it against the official playlist."}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {lecture.pageUrl ? <External href={lecture.pageUrl}>OCW lecture page</External> : null}
        {lecture.slidesUrl ? <External href={lecture.slidesUrl}>Slides</External> : null}
        {lecture.codeUrl ? <External href={lecture.codeUrl}>Code</External> : null}
      </div>

      <section className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
        <h2 className="text-xl">Progress</h2>
        {lecture.requirements.length > 0 ? (
          <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
            {lecture.requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Everything for this lecture is checked off.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <ProgressToggle
            targetType="lecture"
            targetId={lecture.id}
            action="watched"
            done={lecture.status === "watched" || lecture.status === "completed"}
            label="Mark video watched"
            doneLabel="Watched · undo"
            variant="outline"
          />
          <ProgressToggle
            targetType="lecture"
            targetId={lecture.id}
            action="completed"
            done={lecture.complete && lecture.manual}
            label="Mark complete anyway"
            doneLabel="Manually complete · undo"
            variant="secondary"
          />
        </div>
      </section>

      {lecture.finger ? (
        <section id="finger" className="scroll-mt-28 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
          <h2 className="text-xl">{lecture.finger.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{lecture.finger.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {lecture.finger.url ? <External href={lecture.finger.url}>Official prompt</External> : null}
            {lecture.finger.solutionsUrl ? (
              <External href={lecture.finger.solutionsUrl}>Self-check on OCW</External>
            ) : null}
            <ProgressToggle
              targetType="assignment"
              targetId={lecture.finger.id}
              action="completed"
              done={lecture.finger.done}
              label="Mark finger exercise done"
              doneLabel="Finger exercise done · undo"
              variant="outline"
            />
          </div>
        </section>
      ) : null}

      {lecture.questions.length > 0 ? (
        <section id="checks" className="scroll-mt-28 flex flex-col gap-4">
          <div>
            <h2 className="text-2xl">Understanding checks</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Write your own answer. Model answers are not stored or shown. Your tutor can leave a
              note on each one.
            </p>
          </div>
          {lecture.questions.map((question) => (
            <div key={question.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{question.kind === "practice" ? "Practice" : "Concept"}</Badge>
                <span className="text-xs text-muted-foreground">Question {question.order}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{question.prompt}</p>
              <div className="mt-3">
                <AnswerForm questionId={question.id} initialBody={question.answer?.body ?? ""} />
              </div>
              {question.answer?.feedback ? (
                <div className="mt-4 rounded-xl bg-[#e7f3f1] p-3">
                  <p className="text-xs tracking-[0.14em] text-[#0e6b66] uppercase">Tutor note</p>
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                    {question.answer.feedback.body}
                  </p>
                </div>
              ) : question.answer ? (
                <p className="mt-3 text-xs text-muted-foreground">Saved. Waiting on your tutor.</p>
              ) : null}
            </div>
          ))}
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">
          No understanding-check questions for this lecture yet. Watching it is enough to mark it done.
        </p>
      )}

      <nav className="grid gap-3 border-t border-border pt-4 sm:grid-cols-3 sm:items-center" aria-label="Lecture path">
        {lecture.previous ? (
          <Link
            href={`/lectures/${lecture.previous.id}`}
            className="rounded-lg px-1 py-2 text-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e6b66]"
          >
            <span className="block text-xs text-muted-foreground">Previous</span>
            Lecture {lecture.previous.number}: {lecture.previous.title}
          </Link>
        ) : (
          <span />
        )}
        <div className="flex flex-col items-start gap-2 sm:items-center">
          {lecture.complete ? (
            <p className="text-sm font-medium text-[#0e6b66]">This lecture is complete.</p>
          ) : lecture.requirements[0]?.startsWith("Mark the video") ? (
            <ProgressToggle
              targetType="lecture"
              targetId={lecture.id}
              action="watched"
              done={false}
              label="Mark video watched"
              doneLabel="Watched"
            />
          ) : lecture.finger && !lecture.finger.done ? (
            <ProgressToggle
              targetType="assignment"
              targetId={lecture.finger.id}
              action="completed"
              done={false}
              label="Mark finger exercise done"
              doneLabel="Finger exercise done"
            />
          ) : (
            <a
              href="#checks"
              className="inline-flex h-10 items-center rounded-lg bg-[#0e6b66] px-4 text-sm font-semibold text-[#f6f3ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a3f3d]"
            >
              Answer the checks
            </a>
          )}
        </div>
        {lecture.next ? (
          <Link
            href={`/lectures/${lecture.next.id}`}
            className="rounded-lg px-1 py-2 text-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e6b66] sm:text-right"
          >
            <span className="block text-xs text-muted-foreground">Next</span>
            Lecture {lecture.next.number}: {lecture.next.title}
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
