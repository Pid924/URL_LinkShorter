import { formatRelative, formatAbsolute } from "@/lib/format";

const FIXED_NOW = new Date("2026-08-14T12:00:00.000Z").getTime();

beforeEach(() => {
  jest.spyOn(Date, "now").mockReturnValue(FIXED_NOW);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("formatRelative", () => {
  it("returns em dash for null", () => {
    expect(formatRelative(null)).toBe("—");
  });

  it("returns 'just now' for < 5 seconds ago", () => {
    const iso = new Date(FIXED_NOW - 3_000).toISOString();
    expect(formatRelative(iso)).toBe("just now");
  });

  it("returns seconds for 5–59 seconds ago", () => {
    const iso = new Date(FIXED_NOW - 30_000).toISOString();
    expect(formatRelative(iso)).toBe("30s ago");
  });

  it("returns minutes for 1–59 minutes ago", () => {
    const iso = new Date(FIXED_NOW - 15 * 60_000).toISOString();
    expect(formatRelative(iso)).toBe("15m ago");
  });

  it("returns hours for 1–23 hours ago", () => {
    const iso = new Date(FIXED_NOW - 3 * 3_600_000).toISOString();
    expect(formatRelative(iso)).toBe("3h ago");
  });

  it("returns days for 1–29 days ago", () => {
    const iso = new Date(FIXED_NOW - 7 * 86_400_000).toISOString();
    expect(formatRelative(iso)).toBe("7d ago");
  });

  it("returns months for 1–11 months ago", () => {
    const iso = new Date(FIXED_NOW - 60 * 86_400_000).toISOString();
    expect(formatRelative(iso)).toBe("2mo ago");
  });

  it("returns years for >= 12 months ago", () => {
    const iso = new Date(FIXED_NOW - 400 * 86_400_000).toISOString();
    expect(formatRelative(iso)).toBe("1y ago");
  });

  it("returns 'just now' for exactly 4 seconds ago", () => {
    // 4s = 4000ms → diffSec = Math.round(4000/1000) = 4 → "just now"
    const iso = new Date(FIXED_NOW - 4_000).toISOString();
    expect(formatRelative(iso)).toBe("just now");
  });

  it("returns seconds at the 5s boundary", () => {
    // 5s = 5000ms → diffSec = Math.round(5000/1000) = 5 → "5s ago"
    const iso = new Date(FIXED_NOW - 5_000).toISOString();
    expect(formatRelative(iso)).toBe("5s ago");
  });
});

describe("formatAbsolute", () => {
  it("returns 'Never' for null", () => {
    expect(formatAbsolute(null)).toBe("Never");
  });

  it("returns a non-empty string for a valid ISO date", () => {
    const result = formatAbsolute("2026-08-14T10:30:00.000Z");
    expect(result).toBeTruthy();
    expect(result).not.toBe("Never");
  });

  it("includes the year in the formatted string", () => {
    const result = formatAbsolute("2026-08-14T10:30:00.000Z");
    expect(result).toContain("2026");
  });
});
