import Link from "next/link";
import { redirect } from "next/navigation";
import { FeedbackForm } from "@/components/feedback-form";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/session";
import { getReviewQueue } from "@/lib/study";

export const metadata = { title: "Review" };

export default async function TutorPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "TUTOR") {
    return (
      <div className="max-w-xl">
        <h1 className="text-3xl text-[#0a3f3d]">Review is for the tutor</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Momen&apos;s answers stay hidden from model solutions. Sign in with the tutor account to
          leave feedback. The learner account cannot open this queue.
        </p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-[#0e6b66] underline">
          Back to the journey
        </Link>
      </div>
    );
  }

  const params = await searchParams;
  const filter = params.filter === "all" ? "all" : "open";
  const reviews = await getReviewQueue(filter);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs tracking-[0.16em] text-[#0e6b66] uppercase">Tutor</p>
        <h1 className="mt-1 text-4xl text-[#0a3f3d]">Understanding checks</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          These are Momen&apos;s answers. The app does not keep a model answer to compare them with.
        </p>
        <div className="mt-4 flex gap-3 text-sm">
          <Link
            href="/tutor"
            className={filter === "open" ? "underline" : "text-muted-foreground"}
          >
            Needs feedback
          </Link>
          <Link
            href="/tutor?filter=all"
            className={filter === "all" ? "underline" : "text-muted-foreground"}
          >
            All answers
          </Link>
        </div>
      </header>

      {reviews.length === 0 ? (
        <div className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
          <h2 className="text-xl">Nothing waiting</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            When an understanding check is saved, it shows up here without a solution attached.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{review.kind === "practice" ? "Practice" : "Concept"}</Badge>
                <span className="text-xs text-muted-foreground">{review.learner}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                <Link href={`/lectures/${review.lecture.id}`} className="hover:underline">
                  {review.course.title} · Lecture {review.lecture.number}
                </Link>
              </p>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{review.prompt}</p>
              <div className="mt-3 rounded-xl bg-[#f6f1e6] p-3">
                <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">Answer</p>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{review.body}</p>
              </div>
              <div className="mt-4">
                <FeedbackForm answerId={review.id} initialBody={review.feedback?.body ?? ""} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
