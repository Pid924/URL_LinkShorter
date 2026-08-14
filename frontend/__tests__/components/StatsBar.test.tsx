import React from "react";
import { render, screen, within } from "@testing-library/react";
import { StatsBar } from "@/components/StatsBar";
import { ShortLink } from "@/lib/types";

function makeLink(overrides: Partial<ShortLink> = {}): ShortLink {
  return {
    id: 1,
    shortCode: "abc",
    shortUrl: "http://localhost:5000/abc",
    originalUrl: "https://example.com",
    iosUrl: null,
    androidUrl: null,
    createdDate: "2026-08-14T00:00:00Z",
    modifiedDate: "2026-08-14T00:00:00Z",
    lastUsedDate: null,
    totalUsed: 0,
    isEnabled: true,
    ...overrides,
  };
}

// Helper: get the stat value element that sits above a given label
function getStatValue(label: RegExp): string {
  const labelEl = screen.getByText(label);
  const cell = labelEl.closest("div")!.parentElement!;
  return within(cell).getByText(/^\d+$/).textContent!;
}

describe("StatsBar", () => {
  it("renders three stat labels", () => {
    render(<StatsBar links={[]} />);
    expect(screen.getByText(/total links/i)).toBeInTheDocument();
    expect(screen.getByText(/^active$/i)).toBeInTheDocument();
    expect(screen.getByText(/total clicks/i)).toBeInTheDocument();
  });

  it("shows 0 for all stats when links is empty", () => {
    render(<StatsBar links={[]} />);
    expect(getStatValue(/total links/i)).toBe("0");
    expect(getStatValue(/^active$/i)).toBe("0");
    expect(getStatValue(/total clicks/i)).toBe("0");
  });

  it("shows correct total link count", () => {
    render(<StatsBar links={[makeLink({ id: 1 }), makeLink({ id: 2 })]} />);
    expect(getStatValue(/total links/i)).toBe("2");
  });

  it("counts only enabled links as active", () => {
    render(
      <StatsBar
        links={[
          makeLink({ id: 1, isEnabled: true }),
          makeLink({ id: 2, isEnabled: false }),
          makeLink({ id: 3, isEnabled: true }),
        ]}
      />
    );
    expect(getStatValue(/total links/i)).toBe("3");
    expect(getStatValue(/^active$/i)).toBe("2");
  });

  it("sums totalUsed for total clicks", () => {
    render(
      <StatsBar
        links={[
          makeLink({ id: 1, totalUsed: 10 }),
          makeLink({ id: 2, totalUsed: 25 }),
          makeLink({ id: 3, totalUsed: 5 }),
        ]}
      />
    );
    expect(getStatValue(/total clicks/i)).toBe("40");
  });

  it("counts all as active when all are enabled", () => {
    render(<StatsBar links={[makeLink({ id: 1 }), makeLink({ id: 2 })]} />);
    expect(getStatValue(/total links/i)).toBe("2");
    expect(getStatValue(/^active$/i)).toBe("2");
  });

  it("shows 0 active when all links are disabled", () => {
    render(
      <StatsBar
        links={[
          makeLink({ id: 1, isEnabled: false }),
          makeLink({ id: 2, isEnabled: false }),
        ]}
      />
    );
    expect(getStatValue(/^active$/i)).toBe("0");
  });
});
