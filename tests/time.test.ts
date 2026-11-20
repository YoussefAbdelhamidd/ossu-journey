import { describe, expect, it } from "vitest";
import { cairoDate, cairoHour, computeStreak, inMorningWindow } from "@/lib/time";

describe("Cairo study clock", () => {
  it("uses the Cairo calendar date, including after midnight there", () => {
    expect(cairoDate(new Date("2026-01-15T22:30:00Z"))).toBe("2026-01-16");
    expect(cairoDate(new Date("2026-01-15T00:30:00Z"))).toBe("2026-01-15");
  });

  it("treats 7:00–9:00 Cairo as the morning window", () => {
    const inside = new Date("2026-01-15T05:30:00Z");
    const onTheHour = new Date("2026-01-15T05:00:00Z");
    const closed = new Date("2026-01-15T07:00:00Z");
    expect(cairoHour(inside)).toBe(7);
    expect(inMorningWindow(inside)).toBe(true);
    expect(inMorningWindow(onTheHour)).toBe(true);
    expect(cairoHour(closed)).toBe(9);
    expect(inMorningWindow(closed)).toBe(false);
  });

  it("keeps a streak alive until the Cairo day ends", () => {
    const streak = computeStreak(["2026-04-01", "2026-04-02", "2026-04-03"], "2026-04-04");
    expect(streak.studiedToday).toBe(false);
    expect(streak.current).toBe(3);
    expect(streak.best).toBe(3);
  });

  it("breaks the streak when yesterday was missed", () => {
    const streak = computeStreak(["2026-04-01", "2026-04-02"], "2026-04-04");
    expect(streak.current).toBe(0);
    expect(streak.best).toBe(2);
  });

  it("counts today when it was studied", () => {
    const streak = computeStreak(["2026-04-02", "2026-04-03", "2026-04-04"], "2026-04-04");
    expect(streak.studiedToday).toBe(true);
    expect(streak.current).toBe(3);
  });
});
