export type ReadingSeed = {
  id: string;
  courseId: string;
  title: string;
  author?: string;
  kind: "open_pdf" | "purchase" | "free_web";
  url: string;
  summary?: string;
};

/**
 * Companion books for the OSSU desk. Only authorized open copies or purchase pages.
 * No paywalled PDF mirrors.
 */
export const readings: ReadingSeed[] = [
  {
    id: "read-intro-python-think",
    courseId: "intro-python",
    title: "Think Python",
    author: "Allen B. Downey",
    kind: "open_pdf",
    url: "https://greenteapress.com/thinkpython2/thinkpython2.pdf",
    summary: "Free PDF companion while you work through MIT 6.100L.",
  },
  {
    id: "read-intro-python-guttag",
    courseId: "intro-python",
    title: "Introduction to Computation and Programming Using Python",
    author: "John V. Guttag",
    kind: "purchase",
    url: "https://mitpress.mit.edu/9780262542364/introduction-to-computation-and-programming-using-python/",
    summary: "Optional textbook named on the OSSU course page.",
  },
  {
    id: "read-spd-htdp",
    courseId: "systematic-program-design",
    title: "How to Design Programs",
    author: "Felleisen, Findler, Flatt, and Krishnamurthi",
    kind: "free_web",
    url: "https://htdp.org/2024-11-19/Book/index.html",
    summary: "The free book behind How to Code / Systematic Program Design.",
  },
  {
    id: "read-calculus-1a-openstax",
    courseId: "calculus-1a",
    title: "OpenStax Calculus Volume 1",
    author: "OpenStax",
    kind: "open_pdf",
    url: "https://openstax.org/details/books/calculus-volume-1",
    summary: "Open textbook for single-variable differentiation and early integration.",
  },
  {
    id: "read-calculus-1b-openstax",
    courseId: "calculus-1b",
    title: "OpenStax Calculus Volume 1",
    author: "OpenStax",
    kind: "open_pdf",
    url: "https://openstax.org/details/books/calculus-volume-1",
    summary: "Same open volume while you finish integration.",
  },
  {
    id: "read-calculus-1c-openstax",
    courseId: "calculus-1c",
    title: "OpenStax Calculus Volume 2",
    author: "OpenStax",
    kind: "open_pdf",
    url: "https://openstax.org/details/books/calculus-volume-2",
    summary: "Series and coordinate systems in an open textbook.",
  },
  {
    id: "read-math-for-cs-pdf",
    courseId: "math-for-cs",
    title: "Mathematics for Computer Science",
    author: "Lehman, Leighton, and Meyer",
    kind: "open_pdf",
    url: "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_notes/",
    summary: "Course notes / book PDF from the MIT OCW offering.",
  },
  {
    id: "read-math-for-cs-proof",
    courseId: "math-for-cs",
    title: "Book of Proof",
    author: "Richard Hammack",
    kind: "open_pdf",
    url: "https://www.people.vcu.edu/~rhammack/BookOfProof/Main.pdf",
    summary: "A free proof-writing companion before discrete math gets dense.",
  },
  {
    id: "read-nand2tetris-1",
    courseId: "nand2tetris-1",
    title: "The Elements of Computing Systems",
    author: "Nisan and Schocken",
    kind: "purchase",
    url: "https://www.nand2tetris.org/book",
    summary: "The Nand2Tetris book. Purchase when you want the print edition beside the free course site.",
  },
  {
    id: "read-nand2tetris-2",
    courseId: "nand2tetris-2",
    title: "The Elements of Computing Systems",
    author: "Nisan and Schocken",
    kind: "purchase",
    url: "https://www.nand2tetris.org/book",
    summary: "Same book for Part II.",
  },
  {
    id: "read-ostep",
    courseId: "ostep",
    title: "Operating Systems: Three Easy Pieces",
    author: "Remzi and Andrea Arpaci-Dusseau",
    kind: "open_pdf",
    url: "https://pages.cs.wisc.edu/~remzi/OSTEP/",
    summary: "The free OS book that is the course.",
  },
  {
    id: "read-networking",
    courseId: "computer-networking",
    title: "Computer Networking: A Top-Down Approach",
    author: "Kurose and Ross",
    kind: "purchase",
    url: "https://gaia.cs.umass.edu/kurose_ross/interactive/",
    summary: "Textbook companion. Buy a recent edition; the free lecture site stays open.",
  },
  {
    id: "read-prolog",
    courseId: "learn-prolog-now",
    title: "Learn Prolog Now!",
    author: "Blackburn, Bos, and Striegnitz",
    kind: "open_pdf",
    url: "https://github.com/ossu/computer-science/files/6085884/lpn.pdf",
    summary: "CC BY-SA PDF already linked from OSSU.",
  },
  {
    id: "read-formal-logic",
    courseId: "formal-logic",
    title: "forall x: Calgary",
    author: "Open Logic Project",
    kind: "free_web",
    url: "https://forallx.openlogicproject.org/",
    summary: "The open logic book that is the course.",
  },
  {
    id: "read-linear-algebra-hefferon",
    courseId: "linear-algebra",
    title: "Linear Algebra",
    author: "Jim Hefferon",
    kind: "open_pdf",
    url: "https://hefferon.net/linearalgebra/",
    summary: "Free PDF companion while you watch Strang.",
  },
  {
    id: "read-probability",
    courseId: "probability",
    title: "Introduction to Probability",
    author: "Blitzstein and Hwang",
    kind: "open_pdf",
    url: "https://drive.google.com/file/d/1VmkAAGOYCTORq1wxSQqy255qLJjTNvBI/view",
    summary: "Free PDF of the Stat 110 textbook.",
  },
];

export const SECTION_COVERS: Record<string, string> = {
  prerequisites: "/covers/section-prerequisites.svg",
  "intro-cs": "/covers/section-intro-cs.svg",
  "core-cs": "/covers/section-core-cs.svg",
  "advanced-cs": "/covers/section-advanced-cs.svg",
  "final-project": "/covers/section-final-project.svg",
};

export const COURSE_COVERS: Record<string, string> = {
  "intro-python": "/covers/course-intro-python.svg",
  "essence-linear-algebra": "/covers/course-essence-linear-algebra.svg",
};

export function certificateFor(course: { url: string; provider?: string | null }): {
  offersCertificate: boolean;
  certificateLabel: string | null;
} {
  const url = course.url.toLowerCase();
  const provider = (course.provider ?? "").toLowerCase();

  if (url.includes("coursera.org")) {
    return { offersCertificate: true, certificateLabel: "Coursera Certificate" };
  }
  if (url.includes("edx.org") || url.includes("learning.edx.org")) {
    return { offersCertificate: true, certificateLabel: "edX Verified Certificate" };
  }
  if (url.includes("deeplearning.ai")) {
    return { offersCertificate: true, certificateLabel: "DeepLearning.AI Certificate" };
  }
  if (url.includes("openlearninglibrary.mit.edu")) {
    return { offersCertificate: true, certificateLabel: "MITx / Open Learning Library Certificate" };
  }
  if (provider.includes("udacity")) {
    return { offersCertificate: true, certificateLabel: "Udacity Certificate" };
  }

  return { offersCertificate: false, certificateLabel: null };
}
