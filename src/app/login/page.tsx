import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/session";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/dashboard");
  const params = await searchParams;
  const showHint = process.env.NODE_ENV !== "production";

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-12">
      <p className="text-xs tracking-[0.18em] text-[#0e6b66] uppercase">Cairo · 7:00–9:00</p>
      <h1 className="mt-2 text-4xl text-[#0a3f3d]">OSSU Journey</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        One learner, the whole OSSU computer science curriculum, and a place to write what each
        MIT 6.100L lecture actually meant.
      </p>
      <div className="mt-8 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <LoginForm nextPath={params.next ?? "/dashboard"} />
        {showHint ? (
          <div className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
            <p>Local accounts, from your env file:</p>
            <p className="mt-2">
              Learner {process.env.LEARNER_EMAIL ?? "momen@ossu.local"} ·{" "}
              {process.env.LEARNER_PASSWORD ?? "study-at-dawn"}
            </p>
            <p>
              Tutor {process.env.TUTOR_EMAIL ?? "tutor@ossu.local"} ·{" "}
              {process.env.TUTOR_PASSWORD ?? "review-desk"}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
