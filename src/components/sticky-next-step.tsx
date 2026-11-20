"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CurrentItem } from "@/lib/progress";

/** Compact continue strip. Hidden on the dashboard, where the main CTA already lives. */
export function StickyNextStep({ nextStep }: { nextStep: CurrentItem | null }) {
  const pathname = usePathname();
  if (!nextStep || pathname === "/dashboard") return null;

  return (
    <div className="border-t border-border/70">
      <Link
        href={nextStep.href}
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0e6b66]"
      >
        <span className="min-w-0">
          <span className="block text-[11px] font-medium tracking-wide text-[#0e6b66] uppercase">
            Continue
          </span>
          <span className="block truncate text-sm font-medium text-[#1e1a14]">{nextStep.label}</span>
        </span>
        <span className="shrink-0 rounded-lg bg-[#0e6b66] px-3 py-1.5 text-sm font-semibold text-[#f6f3ea]">
          Open
        </span>
      </Link>
    </div>
  );
}
