"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function FeedbackForm({
  answerId,
  initialBody,
}: {
  answerId: string;
  initialBody: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState(initialBody);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const response = await fetch("/api/tutor/feedback", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ answerId, body }),
        });
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) {
          setError(data.error ?? "Could not save feedback.");
          setPending(false);
          return;
        }
        setPending(false);
        router.refresh();
      }}
    >
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="A note for Momen. Don't paste a model answer unless you mean to."
        className="min-h-24 bg-white/70"
        aria-label="Tutor feedback"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending || body.trim().length === 0}>
          {pending ? "Sending…" : initialBody ? "Update feedback" : "Send feedback"}
        </Button>
        {error ? <span className="text-xs text-destructive">{error}</span> : null}
      </div>
    </form>
  );
}
