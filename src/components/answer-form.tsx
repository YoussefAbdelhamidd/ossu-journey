"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AnswerForm({
  questionId,
  initialBody,
}: {
  questionId: string;
  initialBody: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState(initialBody);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        setSaved(false);
        const response = await fetch("/api/answers", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ questionId, body }),
        });
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (!response.ok) {
          setError(data.error ?? "Could not save the answer.");
          setPending(false);
          return;
        }
        setSaved(true);
        setPending(false);
        router.refresh();
      }}
    >
      <Textarea
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
          setSaved(false);
        }}
        placeholder="Write what you understood. Your tutor reads this. There is no model answer here."
        className="min-h-28 bg-white/70"
        aria-label="Your answer"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending || body.trim().length === 0}>
          {pending ? "Saving…" : "Save answer"}
        </Button>
        {saved ? <span className="text-xs text-muted-foreground">Saved</span> : null}
        {error ? <span className="text-xs text-destructive">{error}</span> : null}
      </div>
    </form>
  );
}
