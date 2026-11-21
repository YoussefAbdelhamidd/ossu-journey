import type { LibraryCategory } from "../../src/lib/library-categories";

export type SeedCuratedEpisode = {
  title: string;
  summary: string;
  externalUrl?: string;
  youtubeId?: string;
};

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
  /**
   * Hand-picked official / public-domain links (no pirate streamers).
   * When set, these replace playlist import for that group.
   */
  curatedEpisodes?: SeedCuratedEpisode[];
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

  // —— Film & series (safe free sources only — no pirate / ad / 18+ streamers) ——
  {
    id: "lib-ent-en-films",
    category: "ENTERTAINMENT",
    title: "English set — films & drama (safe free)",
    isCourse: false,
    playlistUrl: "https://www.youtube.com/playlist?list=PLNJtcf4NKZzsgyoYfsAUuGIYDbP6VDqLg",
    coverImage: null,
    order: 0,
    goals: [
      "Only official / public-domain sources — never random “free movie” sites",
      "Silent Chaplin shorts on YouTube are family-safe visual stories for learners",
      "Use BBC / Archive links for spoken English with clean players",
    ],
    curatedEpisodes: [
      {
        title: "BBC Learning English — official programmes hub",
        summary:
          "Free dramas, conversations, and series from BBC Learning English. Watch on their site (cleaner than random streamers).",
        externalUrl: "https://www.bbc.com/learningenglish",
      },
      {
        title: "BBC — Easy English Conversations (A1)",
        summary: "Short, elementary conversation videos for beginners.",
        externalUrl: "https://www.bbc.com/learningenglish/english/features/easy_english_conversations",
      },
      {
        title: "Internet Archive — Express English (BBC collection)",
        summary:
          "Public Archive collection of Express English shorts (Dancing, Freedom, Hope…). Download or stream on archive.org.",
        externalUrl: "https://archive.org/details/ExpressEnglishDancing",
      },
      {
        title: "Internet Archive — English at Work (BBC box set sample)",
        summary: "Office English drama clips from the BBC Learning English archive.",
        externalUrl: "https://archive.org/details/youtube-o1BC8uOzdXo",
      },
      {
        title: "Charlie Chaplin shorts (public-domain era) — YouTube playlist",
        summary:
          "Family-friendly silent comedies. Great for story comprehension without adult ads. Open playlist after import, or use the group’s YouTube import.",
        externalUrl: "https://www.youtube.com/playlist?list=PLNJtcf4NKZzsgyoYfsAUuGIYDbP6VDqLg",
      },
    ],
  },
  {
    id: "lib-ent-de-films",
    category: "ENTERTAINMENT",
    title: "German set — films & series (safe free)",
    isCourse: false,
    playlistUrl: "https://www.youtube.com/playlist?list=PLs7zUO7VPyJ6Ufol7Z4FfkCviaETvl3c8",
    coverImage: null,
    order: 1,
    goals: [
      "Prefer DW + public broadcasters (ARD/ZDF) — geo-blocked sometimes, but legal and ad-safe",
      "Harry + Jojo are learner series made for language study",
      "Die Sendung mit der Maus is ideal beginner listening (family TV)",
    ],
    curatedEpisodes: [
      {
        title: "DW — Learn German with videos (hub)",
        summary: "Official Deutsche Welle video courses and learner series, with exercises.",
        externalUrl: "https://learngerman.dw.com/en/learn-german-with-videos/s-68307454",
      },
      {
        title: "Harry – gefangen in der Zeit (A1–A2) — YouTube",
        summary: "DW learner multimedia series. Family-friendly time-loop story for beginners.",
        externalUrl: "https://www.youtube.com/playlist?list=PLs7zUO7VPyJ6Ufol7Z4FfkCviaETvl3c8",
      },
      {
        title: "Jojo sucht das Glück — Staffel 1 (B1/B2) — YouTube",
        summary: "DW telenovela for intermediate German. Educational; mild teenage drama, not 18+.",
        externalUrl: "https://www.youtube.com/playlist?list=PLs7zUO7VPyJ5q8vaO9vohSzNntbYvItJR",
      },
      {
        title: "Jojo sucht das Glück — Staffel 2 — YouTube",
        summary: "Continue the DW learner series after Staffel 1.",
        externalUrl: "https://www.youtube.com/playlist?list=PLs7zUO7VPyJ6tTk_HgUDHEMn1ej5673fo",
      },
      {
        title: "Jojo sucht das Glück — Staffel 3 — YouTube",
        summary: "Final season of the DW learner telenovela.",
        externalUrl: "https://www.youtube.com/playlist?list=PLs7zUO7VPyJ6-i229_Enu4OCHZKe_PwWO",
      },
      {
        title: "Die Sendung mit der Maus — ARD Mediathek",
        summary: "Classic German children’s show: clear, slow explanations. Free on ARD (may be geo-limited).",
        externalUrl: "https://www.ardmediathek.de/sendung/die-sendung-mit-der-maus/Y3JpZDovL3dkci5kZS9zZW5kdW5nL2RpZS1zZW5kdW5nLW1pdC1kZXItbWF1cw",
      },
      {
        title: "ARD Mediathek — films & series with German subtitles",
        summary: "German public TV. Pick family/education titles; avoid horror listings.",
        externalUrl: "https://www.ardmediathek.de/untertitel",
      },
      {
        title: "ZDF Mediathek — free German TV",
        summary: "Another official German broadcaster library. Use German subtitles when available.",
        externalUrl: "https://www.zdf.de/",
      },
      {
        title: "Easy German — street interviews (start by level)",
        summary: "Real spoken German with dual subtitles. Start at Absolute Beginners / Super Easy.",
        externalUrl: "https://www.easygerman.org/",
      },
    ],
  },

  // —— Shell ——
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
];
