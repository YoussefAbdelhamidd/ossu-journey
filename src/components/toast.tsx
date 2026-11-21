"use client";

import { useEffect, useState } from "react";

export function Toast({
  message,
  lines,
  storageKey,
}: {
  message: string;
  lines?: string[];
  storageKey: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey) === "1") return;
      sessionStorage.setItem(storageKey, "1");
      setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [storageKey]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed right-4 bottom-4 z-50 max-w-sm rounded-2xl bg-[#0a3f3d] p-4 text-[#f6f3ea] shadow-lg ring-1 ring-white/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{message}</p>
          {lines && lines.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#d7ebe6]">
              {lines.slice(0, 5).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <button
          type="button"
          className="rounded-md px-2 py-1 text-xs text-[#d7ebe6] hover:bg-white/10"
          onClick={() => setVisible(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
}
