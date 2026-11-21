"use client";

import { Toast } from "./toast";

export function GoalsToast({
  groupId,
  goals,
}: {
  groupId: string;
  goals: string[];
}) {
  if (goals.length === 0) {
    return (
      <Toast
        storageKey={`goals-empty-${groupId}`}
        message="Add goals for this course so you remember why you started."
        lines={["Open Manage in your library and write a short goal list."]}
      />
    );
  }

  return (
    <Toast
      storageKey={`goals-${groupId}`}
      message="Your goals for this course"
      lines={goals}
    />
  );
}
