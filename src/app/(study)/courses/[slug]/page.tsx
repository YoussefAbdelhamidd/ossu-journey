import { notFound, redirect } from "next/navigation";
import { CourseDesk } from "@/components/course-desk";
import { ApiError } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { getCourse } from "@/lib/study";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: slug };
}

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lecture?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { slug } = await params;
  const query = await searchParams;
  let course;
  try {
    course = await getCourse(session, slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return <CourseDesk course={course} selectedLectureId={query.lecture ?? null} />;
}
