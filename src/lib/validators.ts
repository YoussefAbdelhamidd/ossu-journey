import { z } from "zod";
import { LIBRARY_CATEGORIES } from "./library-categories";

export const loginSchema = z.object({
  email: z.string().trim().min(3).max(200),
  password: z.string().min(1).max(200),
});

export const progressSchema = z.object({
  targetType: z.enum([
    "lecture",
    "assignment",
    "course",
    "library_episode",
    "library_group",
  ]),
  targetId: z.string().min(1).max(200),
  action: z.enum(["watched", "completed", "clear"]),
});

export const libraryCategorySchema = z.enum(LIBRARY_CATEGORIES);

const optionalImageUrl = z
  .union([z.string().url().max(2000), z.literal(""), z.null()])
  .optional()
  .transform((value) => (value === "" || value == null ? null : value));

export const createLibraryGroupSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category: libraryCategorySchema,
  coverImage: optionalImageUrl,
  isCourse: z.boolean().optional(),
  playlistUrl: z.string().trim().max(500).optional().nullable(),
});

export const updateLibraryGroupSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  category: libraryCategorySchema.optional(),
  coverImage: optionalImageUrl,
  isCourse: z.boolean().optional(),
  playlistUrl: z.string().trim().max(500).optional().nullable(),
  order: z.number().int().min(0).max(10_000).optional(),
});

export const createLibraryEpisodeSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  youtubeUrl: z.string().trim().min(1).max(500),
  summary: z.string().trim().max(2000).optional().nullable(),
});

export const replaceGoalsSchema = z.object({
  goals: z.array(z.string().trim().min(1).max(500)).max(50),
});

export const contentMixSchema = z.object({
  mix: z
    .array(
      z.object({
        category: libraryCategorySchema,
        percent: z.number().int().min(0).max(100),
      }),
    )
    .min(1)
    .max(LIBRARY_CATEGORIES.length),
});

export const answerSchema = z.object({
  questionId: z.string().min(1).max(200),
  body: z.string().trim().min(1).max(20_000),
});

export const feedbackSchema = z.object({
  answerId: z.string().min(1).max(200),
  body: z.string().trim().min(1).max(10_000),
});

export const lectureNoteSchema = z.object({
  body: z.string().max(50_000),
});

export const playbackSchema = z.object({
  positionSeconds: z.number().int().min(0).max(86_400),
});
