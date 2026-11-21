import { redirect } from "next/navigation";
import { LibraryManagePanel } from "@/components/library-manage-panel";
import { listLibrary } from "@/lib/library";
import { getSession } from "@/lib/session";

export const metadata = { title: "Control panel" };

export default async function LibraryManagePage({
  searchParams,
}: {
  searchParams: Promise<{ g?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "LEARNER") redirect("/dashboard");

  const data = await listLibrary(session);
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm text-muted-foreground">Private to you</p>
        <h1 className="mt-1 text-3xl tracking-tight text-[#0a3f3d]">Control panel</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Pick a group → edit, add videos, or delete. Creating a group can import a playlist
          in one step.
        </p>
      </header>
      <LibraryManagePanel groups={data.groups} initialGroupId={params.g} />
    </div>
  );
}
