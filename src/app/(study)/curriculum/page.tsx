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
          Courses stay closed until you reach them. Each open course opens as one desk page, like a
          Udemy course.
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
          <div className="mb-4 overflow-hidden rounded-2xl ring-1 ring-foreground/10">
            {section.coverImage ? (
              <div className="relative h-28 sm:h-36">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={section.coverImage}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a3f3d]/80 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <h2 className="text-3xl text-[#f6f3ea]">{section.title}</h2>
                </div>
              </div>
            ) : (
              <h2 className="p-5 text-3xl text-[#0a3f3d]">{section.title}</h2>
            )}
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {section.summary}
          </p>
          <div className="mt-5 flex flex-col gap-6">
            {section.subsections.map((subsection) => (
              <div key={subsection.id} id={subsection.id} className="scroll-mt-20">
                <h3 className="text-xl">{subsection.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{subsection.summary}</p>
                {subsection.topics.length > 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {subsection.topics.join(" · ")}
                  </p>
                ) : null}
                <ul className="mt-3 flex flex-col gap-2">
                  {subsection.courses.map((course) => (
                    <li key={course.id}>
                      <Link
                        href={`/courses/${course.id}`}
                        className="block overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 hover:ring-[#0e6b66]/40"
                      >
                        <div className="flex gap-0">
                          {course.coverImage ? (
                            <div className="relative hidden w-28 shrink-0 sm:block">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={course.coverImage}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                            </div>
                          ) : null}
                          <div className="min-w-0 flex-1 px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">{course.title}</span>
                              {course.required ? null : <Badge variant="outline">Elective</Badge>}
                              {course.choiceGroup ? (
                                <Badge variant="secondary">Choose one</Badge>
                              ) : null}
                              {course.containsMidpoint ? (
                                <Badge className="bg-[#9c4a32] text-white">Midpoint</Badge>
                              ) : null}
                              {course.isCurrent && data.current?.courseId === course.id ? (
                                <Badge>Up next</Badge>
                              ) : null}
                              {!course.unlocked ? (
                                <Badge className="bg-[#9c4a32] text-white">Locked</Badge>
                              ) : null}
                              {course.offersCertificate ? (
                                <Badge variant="secondary">Certificate</Badge>
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
                            {!course.unlocked && course.lockedByTitle ? (
                              <p className="mt-2 text-xs text-[#9c4a32]">
                                Opens after {course.lockedByTitle}
                              </p>
                            ) : null}
                            <Progress value={course.percent} className="mt-3" />
                            <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                              {course.percent}%
                            </p>
                          </div>
                        </div>
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
