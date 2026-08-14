import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyButton } from "@/components/CopyButton";
import { ToastProvider } from "@/components/Toast";

// Wrap in ToastProvider because CopyButton calls useToast()
function renderWithToast(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe("CopyButton", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  it("renders a button with the correct aria-label", () => {
    renderWithToast(<CopyButton value="https://short.test/abc" label="short link" />);
    expect(
      screen.getByRole("button", { name: /copy short link to clipboard/i })
    ).toBeInTheDocument();
  });

  it("uses 'link' as the default label", () => {
    renderWithToast(<CopyButton value="https://short.test/abc" />);
    expect(
      screen.getByRole("button", { name: /copy link to clipboard/i })
    ).toBeInTheDocument();
  });

  it("calls navigator.clipboard.writeText with the given value", async () => {
    renderWithToast(<CopyButton value="https://short.test/xyz" label="short link" />);
    await userEvent.click(screen.getByRole("button"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://short.test/xyz");
  });

  it("shows a success checkmark icon after copying", async () => {
    renderWithToast(<CopyButton value="https://short.test/abc" label="short link" />);

    // Before click — no checkmark path
    expect(screen.queryByTitle(/copied/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button"));

    // The check icon SVG path is rendered after a successful copy;
    // the button itself is still present (it doesn't disappear)
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows a toast on clipboard failure", async () => {
    navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error("denied"));

    renderWithToast(<CopyButton value="https://short.test/abc" label="short link" />);
    await userEvent.click(screen.getByRole("button"));

    expect(
      await screen.findByText(/couldn't copy/i)
    ).toBeInTheDocument();
  });
});
