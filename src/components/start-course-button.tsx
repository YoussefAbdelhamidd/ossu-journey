"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function StartCourseButton({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <Button
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          const response = await fetch(`/api/library/groups/${groupId}/start`, {
            method: "POST",
          });
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          if (!response.ok) {
            setError(data.error ?? "Could not start the course.");
            setPending(false);
            return;
          }
          router.refresh();
          setPending(false);
        }}
      >
        {pending ? "Starting…" : "Start course"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
