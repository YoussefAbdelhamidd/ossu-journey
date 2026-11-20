import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { NextStepStrip } from "./next-step-strip";
import type { SessionUser } from "@/lib/token";
import type { CurrentItem } from "@/lib/progress";

const links = [
  { href: "/dashboard", label: "Journey" },
  { href: "/curriculum", label: "Curriculum" },
];

export function AppShell({
  user,
  nextStep,
  children,
}: {
  user: SessionUser;
  nextStep: CurrentItem | null;
  children: React.ReactNode;
}) {
  const nav = user.role === "TUTOR" ? [...links, { href: "/tutor", label: "Review" }] : links;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-[#fffaf3]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/dashboard"
            className="min-w-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e6b66]"
          >
            <p className="font-sans text-lg leading-snug font-semibold text-[#0a3f3d]">OSSU Journey</p>
            <p className="truncate text-xs text-[#5e564a]">{user.name}</p>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
            {nav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm text-[#1e1a14] hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e6b66]"
              >
                {link.label}
              </Link>
            ))}
            <LogoutButton />
          </nav>
          <div className="sm:hidden">
            <LogoutButton />
          </div>
        </div>
        {user.role === "LEARNER" ? <NextStepStrip nextStep={nextStep} /> : null}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:pb-10">{children}</main>
      <nav
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-[#fffaf3]/95 backdrop-blur sm:hidden"
        aria-label="Primary"
      >
        <ul className="flex">
          {nav.map((link) => (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                className="block px-2 py-3 text-center text-sm font-medium text-[#1e1a14] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0e6b66]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
