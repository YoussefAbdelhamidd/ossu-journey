"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ShareImportButton({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <Button
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          const response = await fetch(`/api/library/import/${token}`, { method: "POST" });
          const data = (await response.json().catch(() => ({}))) as {
            id?: string;
            error?: string;
          };
          if (!response.ok || !data.id) {
            setError(data.error ?? "Could not copy this group.");
            setPending(false);
            return;
          }
          router.push(`/library/g/${data.id}`);
          router.refresh();
        }}
      >
        {pending ? "Copying…" : "Copy to my library"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
