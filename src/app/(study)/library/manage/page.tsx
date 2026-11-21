import { redirect } from "next/navigation";
import { LibraryManagePanel } from "@/components/library-manage-panel";
import { listLibrary } from "@/lib/library";
import { getSession } from "@/lib/session";

export const metadata = { title: "Control panel" };

export default async function LibraryManagePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "LEARNER") redirect("/dashboard");

  const data = await listLibrary(session);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm text-muted-foreground">Private to you</p>
        <h1 className="mt-1 text-3xl tracking-tight text-[#0a3f3d]">Control panel</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Create groups, paste YouTube playlist links, add episodes one by one, set goals,
          and share a copy link with friends. Only you can edit your groups.
        </p>
      </header>
      <LibraryManagePanel groups={data.groups} mix={data.mix} />
    </div>
  );
}
