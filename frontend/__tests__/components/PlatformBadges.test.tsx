import React from "react";
import { render, screen } from "@testing-library/react";
import { PlatformBadges } from "@/components/PlatformBadges";

describe("PlatformBadges", () => {
  it("renders nothing when both URLs are null", () => {
    const { container } = render(<PlatformBadges iosUrl={null} androidUrl={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders only the iOS badge when only iosUrl is set", () => {
    render(<PlatformBadges iosUrl="https://apps.apple.com/app/ex" androidUrl={null} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "https://apps.apple.com/app/ex");
    expect(links[0]).toHaveAttribute("title", expect.stringContaining("iOS"));
  });

  it("renders only the Android badge when only androidUrl is set", () => {
    render(<PlatformBadges iosUrl={null} androidUrl="https://play.google.com/store/apps/ex" />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "https://play.google.com/store/apps/ex");
    expect(links[0]).toHaveAttribute("title", expect.stringContaining("Android"));
  });

  it("renders both badges when both URLs are set", () => {
    render(
      <PlatformBadges
        iosUrl="https://apps.apple.com/app/ex"
        androidUrl="https://play.google.com/store/apps/ex"
      />
    );
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("badges open in a new tab", () => {
    render(
      <PlatformBadges
        iosUrl="https://apps.apple.com/app/ex"
        androidUrl="https://play.google.com/store/apps/ex"
      />
    );
    screen.getAllByRole("link").forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    });
  });

  it("iOS badge title contains the iosUrl", () => {
    render(
      <PlatformBadges
        iosUrl="https://apps.apple.com/app/my-app"
        androidUrl={null}
      />
    );
    expect(screen.getByRole("link")).toHaveAttribute(
      "title",
      expect.stringContaining("https://apps.apple.com/app/my-app")
    );
  });
});
