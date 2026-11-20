import Link from "next/link";
import type { CurrentItem } from "@/lib/progress";

export function NextStepCard({ current }: { current: CurrentItem | null }) {
  if (!current) {
    return (
      <section className="rounded-2xl bg-[#0e6b66] p-5 text-[#f6f3ea] sm:p-6">
        <p className="text-sm font-medium">Next step</p>
        <h2 className="mt-1 text-2xl">The required track is complete.</h2>
        <p className="mt-2 text-sm text-[#d7ebe6]">
          Electives and the final project samples are still on the curriculum if you want them.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-[#0e6b66] p-5 text-[#f6f3ea] sm:p-6">
      <p className="text-sm font-medium">Next step</p>
      <p className="mt-2 text-sm text-[#d7ebe6]">{current.courseTitle}</p>
      <h2 className="mt-1 text-2xl leading-snug">{current.label}</h2>
      <Link
        href={current.href}
        className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-[#f6f3ea] px-5 text-sm font-semibold text-[#0a3f3d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6f3ea]"
      >
        Continue
      </Link>
    </section>
  );
}
