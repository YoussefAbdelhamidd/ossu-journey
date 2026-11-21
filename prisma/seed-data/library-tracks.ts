import type { LibraryCategory } from "../../src/lib/library-categories";

export type SeedLibraryGroup = {
  /** Stable id so re-seed upserts the same groups. */
  id: string;
  category: LibraryCategory;
  title: string;
  isCourse: boolean;
  playlistUrl: string | null;
  coverImage: string | null;
  order: number;
  /** Starter goals shown on courses. */
  goals: string[];
};

/**
 * Free YouTube tracks seeded onto the learner account only.
 * Playlist IDs verified from public course roundups (Jennifer ESL, Anja, lingoni).
 * BBC 6 Minute English uses the official Learning English channel playlist for the series.
 */
export const learnerLibraryGroups: SeedLibraryGroup[] = [
  {
    id: "lib-en-jennifer-beginners",
    category: "ENGLISH",
    title: "English with Jennifer — Beginners 1–65",
    isCourse: true,
    playlistUrl: "https://www.youtube.com/playlist?list=PL0A0C8CFFE9712B76",
    coverImage: null,
    order: 0,
    goals: [
      "Finish one lesson a day without opening unrelated YouTube tabs",
      "Speak the lesson phrases out loud once before marking watched",
      "Reach lesson 65 with a short weekly review note",
    ],
  },
  {
    id: "lib-en-bbc-speak",
    category: "ENGLISH",
    title: "BBC Learning English — The English We Speak",
    isCourse: false,
    playlistUrl: "https://www.youtube.com/playlist?list=PLcetZ6gSk96_sototkO7HFkGA8zL8H0lq",
    coverImage: null,
    order: 1,
    goals: [],
  },
  {
    id: "lib-de-anja-a1",
    category: "GERMAN",
    title: "German with Anja — A1 Lessons 1–63",
    isCourse: true,
    playlistUrl: "https://www.youtube.com/playlist?list=PLYzp2xhTw9W1Z9RvnCoveC0W7pkwUMHXy",
    coverImage: null,
    order: 0,
    goals: [
      "Complete the A1 playlist in order after starting the course",
      "Write three new sentences after every five lessons",
      "Keep entertainment under your mix target while German is active",
    ],
  },
  {
    id: "lib-de-lingoni-a1",
    category: "GERMAN",
    title: "lingoni GERMAN — German A1",
    isCourse: false,
    playlistUrl: "https://www.youtube.com/playlist?list=PL5QyCnFPRx0GxaFjdAVkx7K9TfEklY4sg",
    coverImage: null,
    order: 1,
    goals: [],
  },
  {
    id: "lib-religion-shell",
    category: "RELIGION",
    title: "Religion — add your tracks",
    isCourse: false,
    playlistUrl: null,
    coverImage: null,
    order: 0,
    goals: [],
  },
  {
    id: "lib-entertainment-shell",
    category: "ENTERTAINMENT",
    title: "Entertainment — keep it small",
    isCourse: false,
    playlistUrl: null,
    coverImage: null,
    order: 0,
    goals: [],
  },
];
