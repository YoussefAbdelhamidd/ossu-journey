import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSession } from "@/lib/session";
import { getDashboard } from "@/lib/study";

export const dynamic = "force-dynamic";

export default async function StudyLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const nextStep = session.role === "LEARNER" ? (await getDashboard(session)).current : null;
  return (
    <AppShell user={session} nextStep={nextStep}>
      {children}
    </AppShell>
  );
}
