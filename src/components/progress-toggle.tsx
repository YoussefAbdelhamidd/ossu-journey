"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ProgressToggle({
  targetType,
  targetId,
  action,
  done,
  label,
  doneLabel,
  variant = "default",
}: {
  targetType: "lecture" | "assignment" | "course" | "library_episode" | "library_group";
  targetId: string;
  action: "watched" | "completed";
  done: boolean;
  label: string;
  doneLabel: string;
  variant?: "default" | "outline" | "secondary";
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant={done ? "secondary" : variant}
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          const response = await fetch("/api/progress", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              targetType,
              targetId,
              action: done ? "clear" : action,
            }),
          });
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          if (!response.ok) {
            setError(data.error ?? "Could not save that.");
            setPending(false);
            return;
          }
          router.refresh();
          setPending(false);
        }}
      >
        {pending ? "Saving…" : done ? doneLabel : label}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
