"use client";

import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export function LectureNotes({
  lectureId,
  initialBody,
}: {
  lectureId: string;
  initialBody: string;
}) {
  const [body, setBody] = useState(initialBody);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lectureIdRef = useRef(lectureId);

  useEffect(() => {
    lectureIdRef.current = lectureId;
    setBody(initialBody);
    setStatus("idle");
  }, [lectureId, initialBody]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function scheduleSave(next: string) {
    setBody(next);
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/lectures/${lectureIdRef.current}/notes`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ body: next }),
        });
        setStatus(response.ok ? "saved" : "error");
      } catch {
        setStatus("error");
      }
    }, 700);
  }

  return (
    <section className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl">Episode notes</h2>
        <p className="text-xs text-muted-foreground">
          {status === "saving"
            ? "Saving…"
            : status === "saved"
              ? "Saved"
              : status === "error"
                ? "Could not save"
                : "Private to you"}
        </p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Capture what this lecture meant. Autosaves while you type.
      </p>
      <Textarea
        className="mt-3 min-h-36"
        value={body}
        onChange={(event) => scheduleSave(event.target.value)}
        placeholder="Definitions, examples, questions for your tutor…"
      />
    </section>
  );
}
