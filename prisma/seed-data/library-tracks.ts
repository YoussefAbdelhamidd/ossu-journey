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
 * Free YouTube roadmaps + practice-exam playlists for the learner account.
 * Practice-exam groups are ordered after the matching roadmap so they appear next.
 */
export const learnerLibraryGroups: SeedLibraryGroup[] = [
  // —— English roadmap ——
  {
    id: "lib-en-roadmap-full",
    category: "ENGLISH",
    title: "English roadmap — Full course (001–120)",
    isCourse: true,
    playlistUrl: "https://www.youtube.com/playlist?list=PLUcGzNPLdUGKC-uAchY3vgrxR4Jn0Z1SR",
    coverImage: null,
    order: 0,
    goals: [
      "Follow the playlist in order — this is your English roadmap",
      "After every 10 lessons, take one practice exam from the IELTS group",
      "Say new phrases out loud before marking a lesson watched",
    ],
  },
  {
    id: "lib-en-jennifer-beginners",
    category: "ENGLISH",
    title: "English with Jennifer — Beginners 1–65",
    isCourse: true,
    playlistUrl: "https://www.youtube.com/playlist?list=PL0A0C8CFFE9712B76",
    coverImage: null,
    order: 1,
    goals: [
      "Use this for extra speaking and basics if the roadmap feels fast",
      "Finish a lesson, then do one short exam clip from the practice group",
    ],
  },
  {
    id: "lib-en-practice-ielts",
    category: "ENGLISH",
    title: "Practice exams — IELTS listening (Cambridge)",
    isCourse: false,
    playlistUrl: "https://www.youtube.com/playlist?list=PLYW3qEH4LjXmO4SS_Rr2dAAaHeCcJB9Di",
    coverImage: null,
    order: 2,
    goals: [
      "After every roadmap block, take one full listening practice test",
      "Write your score; retry weak sections the same week",
    ],
  },
  {
    id: "lib-en-bbc-speak",
    category: "ENGLISH",
    title: "BBC Learning English — The English We Speak",
    isCourse: false,
    playlistUrl: "https://www.youtube.com/playlist?list=PLcetZ6gSk96_sototkO7HFkGA8zL8H0lq",
    coverImage: null,
    order: 3,
    goals: [],
  },

  // —— German roadmap ——
  {
    id: "lib-de-nicos-a1",
    category: "GERMAN",
    title: "German roadmap — Nicos Weg A1 (DW)",
    isCourse: true,
    playlistUrl: "https://www.youtube.com/playlist?list=PLs7zUO7VPyJ6eoN6SmB1UcwvPUagK87ix",
    coverImage: null,
    order: 0,
    goals: [
      "This is your A1 roadmap — watch in order after you Start",
      "After every unit block, do a practice-exam video from the exam group",
      "Do DW website exercises when you can (videos alone are not enough)",
    ],
  },
  {
    id: "lib-de-nicos-a2",
    category: "GERMAN",
    title: "German roadmap — Nicos Weg A2 (DW)",
    isCourse: true,
    playlistUrl: "https://www.youtube.com/playlist?list=PLs7zUO7VPyJ7YxTq_g2Rcl3Jthd5bpTdY",
    coverImage: null,
    order: 1,
    goals: [
      "Start only after A1 feels solid",
      "After every unit block, take a B1/DTZ practice clip for listening stamina",
    ],
  },
  {
    id: "lib-de-anja-a1",
    category: "GERMAN",
    title: "German with Anja — A1 Lessons 1–63",
    isCourse: true,
    playlistUrl: "https://www.youtube.com/playlist?list=PLYzp2xhTw9W1Z9RvnCoveC0W7pkwUMHXy",
    coverImage: null,
    order: 2,
    goals: [
      "Extra grammar/vocab alongside Nicos Weg",
      "After five Anja lessons, do one exam-practice video",
    ],
  },
  {
    id: "lib-de-practice-a1",
    category: "GERMAN",
    title: "Practice exams — Goethe A1 speaking (Start Deutsch 1)",
    isCourse: false,
    playlistUrl: "https://www.youtube.com/playlist?list=PLdU1bACQpQnA4GNuGEX-ZHUdAdSg5csD1",
    coverImage: null,
    order: 3,
    goals: [
      "After finishing Nicos Weg A1 blocks, practise speaking parts 1–3 here",
      "Record yourself once per week and compare to the model answers",
    ],
  },
  {
    id: "lib-de-practice-b1",
    category: "GERMAN",
    title: "Practice exams — B1 / DTZ Prüfungstraining",
    isCourse: false,
    playlistUrl: "https://www.youtube.com/playlist?list=PLduNmrQw6nD2Ns8aS5Ex6S6eLeY3GuIAs",
    coverImage: null,
    order: 4,
    goals: [
      "Use after A2 roadmap blocks — letters, speaking parts, exam strategy",
      "Record yourself on speaking tasks at least once a week",
    ],
  },
  {
    id: "lib-de-lingoni-a1",
    category: "GERMAN",
    title: "lingoni GERMAN — German A1 (open reference)",
    isCourse: false,
    playlistUrl: "https://www.youtube.com/playlist?list=PL5QyCnFPRx0GxaFjdAVkx7K9TfEklY4sg",
    coverImage: null,
    order: 5,
    goals: [],
  },

  // —— Shells ——
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
