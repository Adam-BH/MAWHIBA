import { describe, expect, it } from "vitest";
import { layoutDay, minutesOfDay, parseCalendarParams, rangeFor, rangeTitle, shiftDate } from "@/lib/calendar";

const ev = (id: string, start: string, end: string) => ({ id, start: `2026-10-05T${start}:00+00:00`, end: `2026-10-05T${end}:00+00:00` });

describe("calendar ranges (Africa/Tunis)", () => {
  it("weeks start on Monday at local midnight", () => {
    const { days, from, to } = rangeFor("week", "2026-10-08");
    expect(days[0]).toBe("2026-10-05");
    expect(days[6]).toBe("2026-10-11");
    expect(from.toISOString()).toBe("2026-10-04T23:00:00.000Z");
    expect(to.toISOString()).toBe("2026-10-11T23:00:00.000Z");
  });

  it("the month grid has 42 days starting on a Monday", () => {
    const { days } = rangeFor("month", "2026-10-15");
    expect(days).toHaveLength(42);
    expect(days[0]).toBe("2026-09-28");
    expect(days).toContain("2026-10-31");
  });

  it("shifts by a week or a month", () => {
    expect(shiftDate("week", "2026-10-05", 1)).toBe("2026-10-12");
    expect(shiftDate("week", "2026-10-05", -1)).toBe("2026-09-28");
    expect(shiftDate("month", "2026-10-31", 1)).toBe("2026-11-30");
  });

  it("titles the range in French", () => {
    expect(rangeTitle("week", "2026-10-05")).toBe("5 – 11 oct. 2026");
    expect(rangeTitle("week", "2026-09-30")).toBe("28 sept. – 4 oct. 2026");
    expect(rangeTitle("month", "2026-10-05")).toBe("octobre 2026");
  });

  it("reads times in Tunis time", () => {
    expect(minutesOfDay("2026-10-05T08:30:00+00:00")).toBe(9 * 60 + 30);
  });
});

describe("params", () => {
  const now = new Date("2026-10-04T10:00:00Z");
  it("defaults to this week", () => expect(parseCalendarParams({}, now)).toEqual({ view: "week", date: "2026-10-04" }));
  it("keeps valid values", () => expect(parseCalendarParams({ view: "month", date: "2026-11-02" }, now)).toEqual({ view: "month", date: "2026-11-02" }));
  it("ignores invalid values", () => expect(parseCalendarParams({ view: "year", date: "2026-13-45" }, now)).toEqual({ view: "week", date: "2026-10-04" }));
});

describe("layoutDay", () => {
  it("puts 3 overlapping events in 3 columns", () => {
    const l = layoutDay([ev("a", "08:00", "09:00"), ev("b", "08:15", "09:15"), ev("c", "08:30", "09:30")]);
    expect([...l.values()]).toEqual([{ col: 0, cols: 3 }, { col: 1, cols: 3 }, { col: 2, cols: 3 }]);
  });

  it("back-to-back events don't overlap", () => {
    const l = layoutDay([ev("a", "08:00", "09:00"), ev("b", "09:00", "10:00")]);
    expect(l.get("a")).toEqual({ col: 0, cols: 1 });
    expect(l.get("b")).toEqual({ col: 0, cols: 1 });
  });

  it("reuses a freed column inside a cluster", () => {
    const l = layoutDay([ev("a", "08:00", "11:00"), ev("b", "08:00", "09:00"), ev("c", "09:30", "10:00")]);
    expect(l.get("c")).toEqual({ col: 1, cols: 2 });
  });
});
