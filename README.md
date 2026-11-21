# OSSU Journey

A study desk for one learner, Momen, working through the [OSSU Computer Science](https://github.com/ossu/computer-science) curriculum from Cairo. The first course, MIT 6.100L (Fall 2022, Dr. Ana Bell), is filled in lecture by lecture: the official OCW video, slides, code, finger exercises, problem sets, and understanding checks whose answers stay in the database for a tutor to read.

## Stack

- Next.js (App Router) and React, TypeScript
- Tailwind CSS and shadcn/ui
- Prisma with PostgreSQL (Neon in production)
- HTTP-only session cookie (HS256 JWT)

## Run it locally

Postgres has to be reachable before the app starts. From this directory:

```bash
docker compose up -d
cp .env.example .env
```

Edit `.env` so `DATABASE_URL` and `DIRECT_URL` both point at that local database. The stock Postgres image does not speak TLS, so those local URLs use `sslmode=disable`. Neon URLs keep `sslmode=require`.

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

`npm install` generates the Prisma client. `npm run db:setup` applies the committed migrations and seeds. `npm run db:seed` can be run again: it upserts the curriculum and refreshes the two account passwords from the environment. It does not delete progress, answers, or tutor feedback. `npm run db:reset` rebuilds a localhost database only: it drops the `public` schema, reapplies migrations, and seeds again. It refuses any host that is not localhost.

If the database URL is not on localhost, the seed refuses to invent passwords. Set `LEARNER_PASSWORD` and `TUTOR_PASSWORD` (and the emails and names) in the environment.

### Accounts

| Role | Email | Password |
| --- | --- | --- |
| Learner | `momen@ossu.local` | from `LEARNER_PASSWORD` in `.env` |
| Tutor | `tutor@ossu.local` | `review-desk` |

Learners also get a personal **Library** (English/German tracks, religion/entertainment shells, content-mix targets, share/copy). Paste a public YouTube playlist URL in the control panel and use **Import playlist episodes** — no Google API key needed.

Override them in `.env`. The sign-in page shows these values only when `NODE_ENV` is not `production`.

The tutor account is the only one that can leave feedback. Understanding-check pages never show a model answer, because none is stored.

## What the dashboard counts

The big percentage is the **required track**: Intro CS, every required Core CS course, one of the two security-language electives (C/C++ or Java), and the final project. Hours come from the OSSU README (weeks times the midpoint of the weekly effort). Advanced electives and the sample project series are tracked and do not move the bar.

The rust tick at 50% is the curriculum midpoint. The course that contains that hour is where this plan says to start applying for US remote roles.

A lecture counts fully once the video is marked watched, every understanding check has a saved answer, and that lecture's finger exercise is marked done. Watching alone counts as partial credit. "Mark complete anyway" overrides the checklist. Problem sets are their own checkpoints. PS0 is due before lecture 2 (OCW hands it out at lecture 1 and does not grade it). PS1 is due before lecture 9, PS2 before 12, PS3 before 16, PS4 before 20, and PS5 before 25.

The streak uses the Africa/Cairo calendar. Any saved study action, or "Log today's study", counts for the day. A filled day that happened between 7:00 and 9:00 Cairo time is marked more strongly. The streak stays intact through the current Cairo day and breaks if yesterday was missed.

## Tests

```bash
npm test
```

Vitest covers the hour-weighted midpoint, the Cairo streak window, the shape of the seed (26 verified 6.100L videos, 4–6 questions each, problem-set gates), and the API: sign-in, saved answers, tutor-only feedback, and a dashboard that moves after a lecture is marked watched.

## Seed format

Curriculum order and course metadata live in `prisma/seed-data/curriculum.ts`.

Lecture-level detail is a `CourseDetail` (`prisma/seed-data/types.ts`): lectures, optional YouTube IDs, slides and code links, understanding-check questions, and assignments. Register the file in `prisma/seed-data/index.ts`. Stable IDs are `lec-<courseId>-<number>`, `q-<courseId>-<lecture>-<order>`, and `as-<courseId>-<code>`, so a re-seed updates wording and keeps answers attached.

`prisma/seed-data/mit-6100l.ts` is the filled example. `essence-linear-algebra.ts` is a smaller one: 16 verified 3Blue1Brown chapters, no questions yet.

Only put a `youtubeId` in a detail file after you have checked it against the official playlist or course page. Leave `videoTodo` on the course when you have not. Do not invent IDs.

## What is seeded, and what is still TODO

Seeded from the OSSU README as retrieved on 13 November 2026:

- Prerequisites note, Intro CS, Core CS (programming, math, tools, systems, theory, security, applications, ethics), Advanced CS electives, the final project, and the sample project series.
- All 26 lectures of MIT 6.100L, with YouTube IDs taken from the official OCW playlist `PLUl4u3cNGP62A-ynp6v6-LGBCzeH3VAQB`, OCW lecture pages, slide PDFs, and code files (zip for lectures 12, 20, and 25).
- Finger exercises for lectures 1–20, 22, and 23. Lectures 21, 24, 25, and 26 have none on the OCW calendar.
- Problem sets 0–5 with the OCW PDF and starter-code links.
- Five original understanding checks per 6.100L lecture. These are not the OCW finger exercises and they have no stored solutions.
- All 16 chapters of Essence of Linear Algebra, IDs from playlist `PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab`.

Left as TODOs inside the course records:

- Lecture rows for the rest of the curriculum. Most courses only have metadata, the official link, and a `videoTodo`.
- Software Debugging (`PLAwxTw4SYaPkxK63TiT88oEe-AIBhr96A`) and Software Testing (`PLAwxTw4SYaPkWVHeC_8aSIbSxE_NXI76g`) were confirmed as playlists, but the hundreds of short clips were not expanded into lecture rows.
- Missing Semester, Kurose/Ross networking, 18.06SC, 18.404J, and Stat 110 have public video, and their IDs were not copied in. The TODO text on each course says where to verify them.
- Understanding checks exist only for 6.100L.

The OSSU intro-course page says problem set 0 is due before lecture 1. The OCW calendar hands it out at lecture 1, so this app treats it as due before lecture 2.

## API

| Method | Path | Who |
| --- | --- | --- |
| POST | `/api/auth/login` | public |
| POST | `/api/auth/logout` | session |
| GET | `/api/auth/me` | session |
| GET | `/api/health` | public |
| GET | `/api/dashboard` | session |
| GET | `/api/curriculum` | session |
| GET | `/api/courses/:slug` | session |
| GET | `/api/lectures/:id` | session |
| POST | `/api/progress` | session |
| PUT | `/api/answers` | session |
| POST | `/api/study/check-in` | session |
| GET | `/api/tutor/reviews` | tutor |
| POST | `/api/tutor/feedback` | tutor |

`POST /api/progress` takes `{ "targetType": "lecture" \| "assignment" \| "course", "targetId", "action": "watched" \| "completed" \| "clear" }`.

## Deploy on Vercel with Neon

Create a Neon project and copy both connection strings. The pooled host contains `-pooler`. The direct host does not. Leave `sslmode=require` on both.

In the Vercel project settings, set:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Neon pooled URL, with `sslmode=require` and `pgbouncer=true` |
| `DIRECT_URL` | Neon direct URL, with `sslmode=require` |
| `AUTH_SECRET` | A long random string |
| `LEARNER_EMAIL` | Learner sign-in email |
| `LEARNER_PASSWORD` | Learner password |
| `LEARNER_NAME` | Display name |
| `TUTOR_EMAIL` | Tutor sign-in email |
| `TUTOR_PASSWORD` | Tutor password |
| `TUTOR_NAME` | Tutor display name |

`npm run build` generates the Prisma client, runs `prisma migrate deploy` when `DATABASE_URL` is set, then `next build`. Vercel uses that script, so the first deploy creates the tables. No `vercel.json` is required.

Seed once after the database exists, from a machine that has the Neon URLs and the account passwords in its environment:

```bash
npm run db:seed
```

That command is idempotent. Run it again after curriculum edits. It will not wipe study progress.

Do not commit `.env`. The sign-in page only prints the local passwords when `NODE_ENV` is not `production`.

A container image is also in the Dockerfile. It migrates on boot and does not seed. Pass the same environment variables at runtime.
