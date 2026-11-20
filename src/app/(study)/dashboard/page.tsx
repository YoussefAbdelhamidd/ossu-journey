import Link from "next/link";
import { CheckInButton } from "@/components/check-in-button";
import { CoursePath } from "@/components/course-path";
import { JourneyMeter } from "@/components/journey-meter";
import { NextStepCard } from "@/components/next-step-card";
import { StatGrid } from "@/components/stat-grid";
import { Badge } from "@/components/ui/badge";
import { formatHours, formatPercent } from "@/lib/progress";
import { getSession } from "@/lib/session";
import { getDashboard } from "@/lib/study";
import { redirect } from "next/navigation";

export const metadata = { title: "Journey" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const data = await getDashboard(session);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {data.greeting}, {data.learner.name}
          </p>
          <h1 className="mt-1 text-3xl tracking-tight text-[#0a3f3d] sm:text-4xl">Keep the course moving</h1>
        </div>
        <p className="text-sm tabular-nums text-muted-foreground">
          Required track {formatPercent(data.track.percent)}%
        </p>
      </header>

      <NextStepCard
        current={data.current}
        courseCover={data.currentCourse?.coverImage}
        coursePercent={data.currentCourse?.percent}
      />

      {data.timeline.length > 0 && data.currentCourse ? (
        <CoursePath
          courseTitle={data.currentCourse.title}
          courseHref={`/courses/${data.currentCourse.id}`}
          percent={data.currentCourse.percent}
          items={data.timeline}
        />
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <p className="text-xs tracking-[0.14em] text-[#0e6b66] uppercase">Degree progress</p>
          <div className="mt-4">
            <JourneyMeter
              percent={data.track.percent}
              completedHours={data.track.completedHours}
              totalHours={data.track.totalHours}
              midpointTitle={data.track.midpointCourseTitle}
              hoursUntilMidpoint={data.track.hoursUntilMidpoint}
              pastMidpoint={data.track.pastMidpoint}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-sans text-3xl font-semibold tabular-nums text-[#0a3f3d]">
                {data.streak.current}
              </p>
              <p className="text-xs text-muted-foreground">best {data.streak.best}</p>
            </div>
            <p className="text-sm text-muted-foreground">day streak · Cairo</p>
            <ol className="mt-4 grid grid-cols-7 gap-1.5">
              {data.streak.days.slice(-7).map((day) => (
                <li key={day.date} className="text-center">
                  <span
                    className={`mx-auto block size-5 rounded-full ${
                      day.inWindow
                        ? "bg-[#0e6b66]"
                        : day.studied
                          ? "bg-[#d7a15e]"
                          : "bg-[#efe4d2]"
                    } ${day.today ? "ring-2 ring-[#9c4a32] ring-offset-2 ring-offset-card" : ""}`}
                    title={`${day.date}${day.inWindow ? " · inside 7–9" : day.studied ? " · studied" : ""}`}
                  />
                  <span className="mt-1 block text-[10px] text-muted-foreground">{day.label}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl bg-[#0a3f3d] p-5 text-[#f6f3ea]">
            <p className="text-xs tracking-[0.14em] text-[#d7ebe6] uppercase">Morning block</p>
            <p className="mt-2 font-sans text-xl font-semibold">{data.morning.label}</p>
            <p className="mt-1 text-sm text-[#d7ebe6]">
              {data.morning.openNow ? "Window is open now." : "Outside 7:00–9:00 right now."}
            </p>
            <div className="mt-4">
              <CheckInButton studiedToday={data.streak.studiedToday} />
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xl text-[#0a3f3d]">Track checklist</h2>
          <p className="text-xs text-muted-foreground">
            {data.track.pastMidpoint
              ? "Past midpoint"
              : `${formatHours(data.track.hoursUntilMidpoint)} to midpoint`}
          </p>
        </div>
        <StatGrid
          items={[
            {
              label: "Courses",
              value: `${data.counts.coursesDone} / ${data.counts.coursesTotal}`,
              done: data.counts.coursesDone,
              total: data.counts.coursesTotal,
            },
            {
              label: "Lectures",
              value: `${data.counts.lecturesDone} / ${data.counts.lecturesTotal}`,
              done: data.counts.lecturesDone,
              total: data.counts.lecturesTotal,
            },
            {
              label: "Checks",
              value: `${data.counts.questionsDone} / ${data.counts.questionsTotal}`,
              done: data.counts.questionsDone,
              total: data.counts.questionsTotal,
            },
            {
              label: "Problem sets",
              value: `${data.counts.problemSetsDone} / ${data.counts.problemSetsTotal}`,
              done: data.counts.problemSetsDone,
              total: data.counts.problemSetsTotal,
            },
          ]}
        />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-xl text-[#0a3f3d]">Curriculum map</h2>
          <Link
            href="/curriculum"
            className="text-sm text-[#0e6b66] underline-offset-4 hover:underline"
          >
            Open full list
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.groups.map((group) => {
            const required = group.courses.filter((course) => course.required);
            const average =
              required.length === 0
                ? 0
                : required.reduce((sum, course) => sum + course.percent, 0) / required.length;
            const isCurrentGroup = group.courses.some(
              (course) => course.id === data.current?.courseId,
            );
            return (
              <li
                key={group.id}
                className={`rounded-2xl bg-card p-4 ring-1 ${
                  isCurrentGroup ? "ring-[#0e6b66]/50" : "ring-foreground/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{group.sectionTitle}</p>
                    <h3 className="text-lg text-[#0a3f3d]">{group.title}</h3>
                  </div>
                  <Badge variant="outline">{Math.round(average)}%</Badge>
                </div>
                <ul className="mt-3 space-y-2">
                  {group.courses.slice(0, 3).map((course) => (
                    <li key={course.id}>
                      <Link
                        href={`/courses/${course.id}`}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="truncate">
                          {course.id === data.current?.courseId ? (
                            <span className="mr-1 text-[#0e6b66]">●</span>
                          ) : null}
                          {course.title}
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          {course.percent}%
                        </span>
                      </Link>
                    </li>
                  ))}
                  {group.courses.length > 3 ? (
                    <li className="text-xs text-muted-foreground">
                      + {group.courses.length - 3} more
                    </li>
                  ) : null}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
