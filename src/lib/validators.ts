import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(3).max(200),
  password: z.string().min(1).max(200),
});

export const progressSchema = z.object({
  targetType: z.enum(["lecture", "assignment", "course"]),
  targetId: z.string().min(1).max(200),
  action: z.enum(["watched", "completed", "clear"]),
});

export const answerSchema = z.object({
  questionId: z.string().min(1).max(200),
  body: z.string().trim().min(1).max(20_000),
});

export const feedbackSchema = z.object({
  answerId: z.string().min(1).max(200),
  body: z.string().trim().min(1).max(10_000),
});
