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
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center gap-8 px-4 py-12 lg:flex-row lg:items-stretch">
      <div
        className="flex min-h-48 flex-col justify-end overflow-hidden rounded-2xl p-6 text-[#f6f3ea] lg:w-[28rem] lg:min-h-[28rem]"
        style={{
          background:
            "radial-gradient(circle at 80% 18%, #fff7eaaa, transparent 42%), linear-gradient(145deg, #0a3f3d 0%, #0e6b66 55%, #c4893f 100%)",
        }}
      >
        <p className="text-xs tracking-[0.18em] text-[#d7ebe6] uppercase">Cairo · 7:00–9:00</p>
        <p className="mt-3 font-sans text-3xl font-semibold leading-tight">Programs, languages, and the rest — on purpose</p>
        <p className="mt-3 text-sm text-[#d7ebe6]">
          Your library, mix targets, locked courses, and YouTube tracks without the rabbit hole.
        </p>
      </div>
      <div className="mx-auto flex w-full max-w-lg flex-col justify-center">
        <p className="text-xs tracking-[0.18em] text-[#0e6b66] uppercase">Learning Hub</p>
        <h1 className="mt-2 text-4xl text-[#0a3f3d]">Sign in</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          OSSU programs plus your own English, German, and other groups.
        </p>
        <div className="mt-8 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <LoginForm nextPath={params.next ?? "/dashboard"} />
          {showHint ? (
            <div className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
              <p>Local accounts, from your env file:</p>
              <p className="mt-2">
                Learner {process.env.LEARNER_EMAIL ?? "momen@ossu.local"} ·{" "}
                {process.env.LEARNER_PASSWORD ?? "Vdlz1L4P5icHj4aQW-Lr"}
              </p>
              <p>
                Tutor {process.env.TUTOR_EMAIL ?? "tutor@ossu.local"} ·{" "}
                {process.env.TUTOR_PASSWORD ?? "review-desk"}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
