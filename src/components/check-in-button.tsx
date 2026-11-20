"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CheckInButton({ studiedToday }: { studiedToday: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant={studiedToday ? "secondary" : "default"}
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          const response = await fetch("/api/study/check-in", { method: "POST" });
          if (!response.ok) {
            setError("Could not log today.");
            setPending(false);
            return;
          }
          router.refresh();
          setPending(false);
        }}
      >
        {pending ? "Logging…" : studiedToday ? "Studied today" : "Log today's study"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
