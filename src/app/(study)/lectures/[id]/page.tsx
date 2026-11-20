import { notFound, redirect } from "next/navigation";
import { ApiError } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { getLecture } from "@/lib/study";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: id };
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

  if (!lecture.unlocked) {
    redirect(`/courses/${lecture.course.id}`);
  }

  redirect(`/courses/${lecture.course.id}?lecture=${lecture.id}`);
}
