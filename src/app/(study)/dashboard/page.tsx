import Link from "next/link";
import { CheckInButton } from "@/components/check-in-button";
import { CoursePath } from "@/components/course-path";
import { JourneyMeter } from "@/components/journey-meter";
import { NextStepCard } from "@/components/next-step-card";
import { StatGrid } from "@/components/stat-grid";
import { Badge } from "@/components/ui/badge";
import { formatHours } from "@/lib/progress";
import { getSession } from "@/lib/session";
import { getDashboard } from "@/lib/study";
import { redirect } from "next/navigation";

export const metadata = { title: "Journey" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const data = await getDashboard(session);

  return (
    <div className="flex flex-col gap-6">
      <NextStepCard current={data.current} />
      {data.timeline.length > 0 && data.currentCourse ? (
        <CoursePath
          courseTitle={data.currentCourse.title}
          percent={data.currentCourse.percent}
          items={data.timeline}
        />
      ) : null}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-7">
          <p className="text-sm text-muted-foreground">
            {data.greeting}, {data.learner.name}
          </p>
          <h1 className="mt-1 text-3xl text-[#0a3f3d]">Today&apos;s stretch of the degree</h1>
          <div className="mt-6">
            <JourneyMeter
              percent={data.track.percent}
              completedHours={data.track.completedHours}
              totalHours={data.track.totalHours}
              midpointTitle={data.track.midpointCourseTitle}
              hoursUntilMidpoint={data.track.hoursUntilMidpoint}
              pastMidpoint={data.track.pastMidpoint}
            />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Advanced electives are on the curriculum and do not move this bar. The security
            language courses count as one slot: finish either C/C++ or Java.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-[#0a3f3d] p-5 text-[#f6f3ea]">
            <p className="text-xs tracking-[0.16em] text-[#d7ebe6] uppercase">Morning block</p>
            <p className="mt-2 font-sans text-2xl leading-snug font-semibold">{data.morning.label}</p>
            <p className="text-sm text-[#d7ebe6]">Africa/Cairo</p>
            <p className="mt-3 text-sm">
              {data.morning.openNow
                ? "The window is open."
                : "Outside the window right now."}{" "}
              {data.morning.studiedInWindowToday
                ? "Today already has a mark inside 7:00–9:00."
                : "A stronger day-mark means the study landed inside the window."}
            </p>
            <div className="mt-4">
              <CheckInButton studiedToday={data.streak.studiedToday} />
            </div>
          </div>
          <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <div className="flex items-baseline justify-between">
              <p className="font-sans text-3xl leading-tight font-semibold tabular-nums">{data.streak.current}</p>
              <p className="text-sm text-muted-foreground">best {data.streak.best}</p>
            </div>
            <p className="text-sm text-muted-foreground">day study streak</p>
            <ol className="mt-4 grid grid-cols-7 gap-1.5">
              {data.streak.days.map((day) => (
                <li key={day.date} className="text-center">
                  <span
                    className={`mx-auto block size-6 rounded-full ${
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
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl text-[#0a3f3d]">Required track</h2>
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
              label: "Questions answered",
              value: `${data.counts.questionsDone} / ${data.counts.questionsTotal}`,
              done: data.counts.questionsDone,
              total: data.counts.questionsTotal,
            },
            {
              label: "Finger exercises",
              value: `${data.counts.fingersDone} / ${data.counts.fingersTotal}`,
              done: data.counts.fingersDone,
              total: data.counts.fingersTotal,
            },
            {
              label: "Problem sets",
              value: `${data.counts.problemSetsDone} / ${data.counts.problemSetsTotal}`,
              done: data.counts.problemSetsDone,
              total: data.counts.problemSetsTotal,
            },
            {
              label: "Tutor notes",
              value: String(data.counts.feedbackReceived),
            },
            {
              label: "To the midpoint",
              value: data.track.pastMidpoint ? "Past it" : formatHours(data.track.hoursUntilMidpoint),
            },
          ]}
        />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-2xl">The path</h2>
          <Link href="/curriculum" className="text-sm text-[#0e6b66] underline-offset-4 hover:underline">
            Full curriculum
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.groups.map((group) => {
            const required = group.courses.filter((course) => course.required);
            const average =
              required.length === 0
                ? 0
                : required.reduce((sum, course) => sum + course.percent, 0) / required.length;
            return (
              <li key={group.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{group.sectionTitle}</p>
                    <h3 className="text-lg">{group.title}</h3>
                  </div>
                  <Badge variant="outline">{Math.round(average)}%</Badge>
                </div>
                <ul className="mt-3 space-y-2">
                  {group.courses.slice(0, 4).map((course) => (
                    <li key={course.id}>
                      <Link href={`/courses/${course.id}`} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate">{course.title}</span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">{course.percent}%</span>
                      </Link>
                    </li>
                  ))}
                  {group.courses.length > 4 ? (
                    <li className="text-xs text-muted-foreground">
                      + {group.courses.length - 4} more
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
