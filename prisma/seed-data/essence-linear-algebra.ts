import type { CourseDetail } from "./types";

/**
 * Verified with yt-dlp against playlist PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab
 * (3Blue1Brown, Essence of linear algebra) on 13 Nov 2026.
 * No understanding-check questions yet. Add a questions array per lecture
 * in the same shape as mit-6100l.ts when you want them.
 */
const chapters: { title: string; youtubeId: string; durationSeconds: number }[] = [
  { title: "Vectors", youtubeId: "fNk_zzaMoSs", durationSeconds: 592 },
  {
    title: "Linear combinations, span, and basis vectors",
    youtubeId: "k7RM-ot2NWY",
    durationSeconds: 599,
  },
  {
    title: "Linear transformations and matrices",
    youtubeId: "kYB8IZa5AuE",
    durationSeconds: 659,
  },
  {
    title: "Matrix multiplication as composition",
    youtubeId: "XkY2DOUCWMU",
    durationSeconds: 604,
  },
  {
    title: "Three-dimensional linear transformations",
    youtubeId: "rHLEWRxRGiM",
    durationSeconds: 286,
  },
  { title: "The determinant", youtubeId: "Ip3X9LOh2dk", durationSeconds: 603 },
  {
    title: "Inverse matrices, column space, and null space",
    youtubeId: "uQhTuRlWMxw",
    durationSeconds: 729,
  },
  {
    title: "Nonsquare matrices as transformations between dimensions",
    youtubeId: "v8VSDg_WQlA",
    durationSeconds: 267,
  },
  {
    title: "Dot products and duality",
    youtubeId: "LyGKycYT2v0",
    durationSeconds: 852,
  },
  { title: "Cross products", youtubeId: "eu6i7WJeinw", durationSeconds: 534 },
  {
    title: "Cross products in the light of linear transformations",
    youtubeId: "BaM7OCEm3G0",
    durationSeconds: 790,
  },
  {
    title: "Cramer's rule, explained geometrically",
    youtubeId: "jBsC34PxzoM",
    durationSeconds: 732,
  },
  { title: "Change of basis", youtubeId: "P2LTAUO1TdA", durationSeconds: 771 },
  {
    title: "Eigenvectors and eigenvalues",
    youtubeId: "PFDu9oVAE-g",
    durationSeconds: 1036,
  },
  {
    title: "A quick trick for computing eigenvalues",
    youtubeId: "e50Bj7jn9IQ",
    durationSeconds: 793,
  },
  {
    title: "Abstract vector spaces",
    youtubeId: "TgKwz5Ikpc8",
    durationSeconds: 1006,
  },
];

const playlist = "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab";

export const essenceLinearAlgebra: CourseDetail = {
  courseId: "essence-linear-algebra",
  lectures: chapters.map((chapter, index) => ({
    number: index + 1,
    title: chapter.title,
    summary: `Chapter ${index + 1} of Essence of Linear Algebra. Mark it done after you watch it. Understanding-check questions are not written for this course yet.`,
    youtubeId: chapter.youtubeId,
    durationSeconds: chapter.durationSeconds,
    pageUrl: `https://www.youtube.com/watch?v=${chapter.youtubeId}&list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab`,
  })),
};

export const essencePlaylistUrl = playlist;
