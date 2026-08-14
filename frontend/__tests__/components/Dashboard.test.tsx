import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dashboard } from "@/components/Dashboard";
import { ToastProvider } from "@/components/Toast";
import * as apiClient from "@/lib/api-client";
import { ShortLink } from "@/lib/types";

jest.mock("qrcode.react", () => ({
  QRCodeCanvas: () => <div data-testid="qr-canvas" />,
}));

jest.mock("@/lib/api-client", () => ({
  ...jest.requireActual("@/lib/api-client"),
  fetchLinks: jest.fn(),
  updateLinkRequest: jest.fn(),
  deleteLinkRequest: jest.fn(),
}));

function makeLink(overrides: Partial<ShortLink> = {}): ShortLink {
  return {
    id: 1,
    shortCode: "abc123",
    shortUrl: "http://localhost:5000/abc123",
    originalUrl: "https://example.com",
    iosUrl: null,
    androidUrl: null,
    createdDate: "2026-08-14T00:00:00Z",
    modifiedDate: "2026-08-14T00:00:00Z",
    lastUsedDate: null,
    totalUsed: 5,
    isEnabled: true,
    ...overrides,
  };
}

function renderDashboard(initialLinks: ShortLink[] = [], initialError: string | null = null) {
  return render(
    <ToastProvider>
      <Dashboard initialLinks={initialLinks} initialError={initialError} />
    </ToastProvider>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

describe("Dashboard — empty state", () => {
  it("shows the empty state when there are no links", () => {
    renderDashboard([]);
    expect(screen.getByText(/no links yet/i)).toBeInTheDocument();
  });

  it("does not show the empty state when there are links", () => {
    renderDashboard([makeLink()]);
    expect(screen.queryByText(/no links yet/i)).not.toBeInTheDocument();
  });
});

// ── Error banner ──────────────────────────────────────────────────────────────

describe("Dashboard — API error banner", () => {
  it("shows the error banner when initialError is set", () => {
    renderDashboard([], "Couldn't reach the API.");
    expect(screen.getByText("Couldn't reach the API.")).toBeInTheDocument();
  });

  it("does not show the error banner when initialError is null", () => {
    renderDashboard([], null);
    expect(screen.queryByText(/couldn't reach/i)).not.toBeInTheDocument();
  });

  it("shows a Retry button when there is an error", () => {
    renderDashboard([], "Couldn't reach the API.");
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("clears the error banner after a successful Retry", async () => {
    (apiClient.fetchLinks as jest.Mock).mockResolvedValue([makeLink()]);
    renderDashboard([], "Couldn't reach the API.");
    await userEvent.click(screen.getByRole("button", { name: /retry/i }));
    await waitFor(() => {
      expect(screen.queryByText("Couldn't reach the API.")).not.toBeInTheDocument();
    });
  });
});

// ── Stats bar ─────────────────────────────────────────────────────────────────

describe("Dashboard — stats bar", () => {
  it("renders stat labels", () => {
    renderDashboard([makeLink()]);
    expect(screen.getByText(/total links/i)).toBeInTheDocument();
    expect(screen.getByText(/total clicks/i)).toBeInTheDocument();
  });
});

// ── New link drawer ───────────────────────────────────────────────────────────

describe("Dashboard — New link drawer", () => {
  it("opens the drawer when New link is clicked", async () => {
    renderDashboard([]);
    await userEvent.click(screen.getByRole("button", { name: /new link/i }));
    expect(screen.getByRole("heading", { name: /new link/i })).toBeInTheDocument();
  });

  it("closes the drawer when Cancel is clicked", async () => {
    renderDashboard([]);
    await userEvent.click(screen.getByRole("button", { name: /new link/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByRole("heading", { name: /new link/i })).not.toBeInTheDocument();
  });

  it("closes the drawer when Escape is pressed", async () => {
    renderDashboard([]);
    await userEvent.click(screen.getByRole("button", { name: /new link/i }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("heading", { name: /new link/i })).not.toBeInTheDocument();
  });
});

// ── Enable / Disable toggle ───────────────────────────────────────────────────

describe("Dashboard — enable/disable", () => {
  it("optimistically disables a link on toggle", async () => {
    (apiClient.updateLinkRequest as jest.Mock).mockResolvedValue(makeLink({ isEnabled: false }));
    renderDashboard([makeLink({ isEnabled: true })]);

    // The table and mobile-card both render; use the first switch
    const [firstToggle] = screen.getAllByRole("switch", { name: /disable link/i });
    await userEvent.click(firstToggle);

    await waitFor(() => {
      expect(screen.getAllByRole("switch", { name: /enable link/i }).length).toBeGreaterThan(0);
    });
  });

  it("rolls back on API failure", async () => {
    (apiClient.updateLinkRequest as jest.Mock).mockRejectedValue(
      new apiClient.ApiRequestError("Server error", 500)
    );
    renderDashboard([makeLink({ isEnabled: true })]);

    const [firstToggle] = screen.getAllByRole("switch", { name: /disable link/i });
    await userEvent.click(firstToggle);

    await waitFor(() => {
      expect(screen.getAllByRole("switch", { name: /disable link/i }).length).toBeGreaterThan(0);
    });
  });
});

// ── Delete ────────────────────────────────────────────────────────────────────

describe("Dashboard — delete", () => {
  it("removes the link from the list after deletion", async () => {
    (apiClient.deleteLinkRequest as jest.Mock).mockResolvedValue(undefined);
    renderDashboard([makeLink({ shortCode: "todelete" })]);

    // "todelete" appears in both the table row and the mobile card
    expect(screen.getAllByText("todelete").length).toBeGreaterThan(0);

    // Click first delete button, then confirm
    const [firstDelete] = screen.getAllByRole("button", { name: /delete link/i });
    await userEvent.click(firstDelete);
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.queryAllByText("todelete")).toHaveLength(0);
    });
  });
});

// ── QR modal ─────────────────────────────────────────────────────────────────

describe("Dashboard — QR modal", () => {
  it("opens the QR modal when the QR button is clicked", async () => {
    renderDashboard([makeLink()]);
    const [firstQrBtn] = screen.getAllByRole("button", { name: /show qr code/i });
    await userEvent.click(firstQrBtn);
    expect(screen.getByTestId("qr-canvas")).toBeInTheDocument();
  });

  it("closes the QR modal when Close is clicked", async () => {
    renderDashboard([makeLink()]);
    const [firstQrBtn] = screen.getAllByRole("button", { name: /show qr code/i });
    await userEvent.click(firstQrBtn);
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByTestId("qr-canvas")).not.toBeInTheDocument();
  });
});
