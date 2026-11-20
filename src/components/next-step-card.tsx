import Link from "next/link";
import { CourseCover } from "@/components/course-cover";
import type { CurrentItem } from "@/lib/progress";

const stepHint: Record<CurrentItem["step"], string> = {
  watch: "Open the course desk and resume the video",
  finger: "Finish the finger exercise, then keep going",
  questions: "Answer the understanding checks for this lecture",
  problem_set: "Mark the problem set done to unlock the next lecture",
  course: "Open the course and keep moving through the list",
};

export function NextStepCard({
  current,
  coursePercent,
}: {
  current: CurrentItem | null;
  courseCover?: string | null;
  coursePercent?: number | null;
}) {
  if (!current) {
    return (
      <section className="overflow-hidden rounded-2xl bg-[#0a3f3d] text-[#f6f3ea]">
        <div className="p-6 sm:p-8">
          <p className="text-xs tracking-[0.16em] text-[#d7ebe6] uppercase">Required track</p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight sm:text-4xl">
            You finished the required path
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#d7ebe6]">
            Electives and project samples are still on the curriculum if you want to go deeper.
          </p>
          <Link
            href="/curriculum"
            className="mt-6 inline-flex h-11 items-center rounded-lg bg-[#f6f3ea] px-5 text-sm font-semibold text-[#0a3f3d]"
          >
            Browse curriculum
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl bg-[#0a3f3d] text-[#f6f3ea] shadow-sm">
      <div className="grid sm:grid-cols-[200px_1fr]">
        <CourseCover title={current.courseTitle} className="min-h-40 sm:min-h-full" />
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs tracking-[0.14em] text-[#d7ebe6] uppercase">
            <span>Up next</span>
            {coursePercent != null ? (
              <span className="rounded-full bg-white/10 px-2 py-0.5 tabular-nums normal-case tracking-normal">
                {coursePercent}% of this course
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-sm text-[#d7ebe6]">{current.courseTitle}</p>
          <h1 className="mt-1 font-sans text-2xl leading-snug font-semibold tracking-tight sm:text-3xl">
            {current.label}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-[#d7ebe6]">{stepHint[current.step]}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={current.href}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#f6f3ea] px-5 text-sm font-semibold text-[#0a3f3d] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6f3ea]"
            >
              Continue studying
            </Link>
            <Link
              href={`/courses/${current.courseId}`}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-white/25 px-5 text-sm font-medium text-[#f6f3ea] transition hover:bg-white/10"
            >
              Course desk
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
