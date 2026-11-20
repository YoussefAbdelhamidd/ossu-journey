import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getSession } from "@/lib/session";
import { getCurriculum } from "@/lib/study";
import { formatPercent } from "@/lib/progress";
import { redirect } from "next/navigation";

export const metadata = { title: "Curriculum" };

export default async function CurriculumPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const data = await getCurriculum(session);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-xs tracking-[0.16em] text-[#0e6b66] uppercase">OSSU computer science</p>
        <h1 className="mt-1 text-4xl text-[#0a3f3d]">The whole curriculum</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Order follows the OSSU README. Required-track progress is {formatPercent(data.track.percent)}%.
          The rust marker is the midpoint, where this plan says to start applying for US remote roles.
          Courses without a lecture list still link out. Their video IDs are a TODO until they are
          verified.
        </p>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {data.sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="shrink-0 rounded-full bg-secondary px-3 py-1 text-sm"
            >
              {section.title}
            </a>
          ))}
        </div>
      </header>

      {data.sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-20">
          <h2 className="text-3xl text-[#0a3f3d]">{section.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{section.summary}</p>
          <div className="mt-5 flex flex-col gap-6">
            {section.subsections.map((subsection) => (
              <div key={subsection.id} id={subsection.id} className="scroll-mt-20">
                <h3 className="text-xl">{subsection.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{subsection.summary}</p>
                {subsection.topics.length > 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">{subsection.topics.join(" · ")}</p>
                ) : null}
                <ul className="mt-3 flex flex-col gap-2">
                  {subsection.courses.map((course) => (
                    <li key={course.id}>
                      <Link
                        href={`/courses/${course.id}`}
                        className="block rounded-2xl bg-card px-4 py-3 ring-1 ring-foreground/10 hover:ring-[#0e6b66]/40"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{course.title}</span>
                          {course.required ? null : <Badge variant="outline">Elective</Badge>}
                          {course.choiceGroup ? <Badge variant="secondary">Choose one</Badge> : null}
                          {course.containsMidpoint ? (
                            <Badge className="bg-[#9c4a32] text-white">Midpoint</Badge>
                          ) : null}
                          {course.isCurrent && data.current?.courseId === course.id ? (
                            <Badge>Up next</Badge>
                          ) : null}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {course.provider ? <span>{course.provider}</span> : null}
                          {course.effort ? <span>{course.effort}</span> : null}
                          {course.lectureCount > 0 ? (
                            <span>{course.lectureCount} lectures</span>
                          ) : (
                            <span>Course-level tracking</span>
                          )}
                        </div>
                        <Progress value={course.percent} className="mt-3" />
                        <p className="mt-1 text-xs tabular-nums text-muted-foreground">{course.percent}%</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
