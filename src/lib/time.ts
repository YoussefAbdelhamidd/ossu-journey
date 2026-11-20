export const CAIRO_TZ = "Africa/Cairo";
export const MORNING_START_HOUR = 7;
export const MORNING_END_HOUR = 9;

export function cairoDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CAIRO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function cairoHour(date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CAIRO_TZ,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value;
  return Number(hour);
}

export function inMorningWindow(date = new Date()): boolean {
  const hour = cairoHour(date);
  return hour >= MORNING_START_HOUR && hour < MORNING_END_HOUR;
}

export function greeting(date = new Date()): string {
  const hour = cairoHour(date);
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function addCalendarDays(isoDate: string, delta: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

export function weekdayNarrow(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "narrow",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T12:00:00Z`));
}

export type Streak = {
  current: number;
  best: number;
  studiedToday: boolean;
};

export function computeStreak(dates: string[], today: string): Streak {
  const unique = [...new Set(dates)].sort();
  const set = new Set(unique);
  let best = 0;
  let run = 0;
  let previous: string | null = null;

  for (const date of unique) {
    if (previous && addCalendarDays(previous, 1) === date) run += 1;
    else run = 1;
    best = Math.max(best, run);
    previous = date;
  }

  const studiedToday = set.has(today);
  let cursor = studiedToday ? today : addCalendarDays(today, -1);
  let current = 0;
  while (set.has(cursor)) {
    current += 1;
    cursor = addCalendarDays(cursor, -1);
  }

  return { current, best, studiedToday };
}

export function recentDates(today: string, count: number): string[] {
  const dates: string[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    dates.push(addCalendarDays(today, -offset));
  }
  return dates;
}
