import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EnabledToggle } from "@/components/EnabledToggle";

describe("EnabledToggle", () => {
  it("renders a switch button", () => {
    render(<EnabledToggle enabled={true} onChange={jest.fn()} />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("has aria-checked=true when enabled", () => {
    render(<EnabledToggle enabled={true} onChange={jest.fn()} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("has aria-checked=false when disabled", () => {
    render(<EnabledToggle enabled={false} onChange={jest.fn()} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("has aria-label 'Disable link' when currently enabled", () => {
    render(<EnabledToggle enabled={true} onChange={jest.fn()} />);
    expect(screen.getByRole("switch")).toHaveAccessibleName("Disable link");
  });

  it("has aria-label 'Enable link' when currently disabled", () => {
    render(<EnabledToggle enabled={false} onChange={jest.fn()} />);
    expect(screen.getByRole("switch")).toHaveAccessibleName("Enable link");
  });

  it("calls onChange(false) when clicked while enabled", async () => {
    const onChange = jest.fn();
    render(<EnabledToggle enabled={true} onChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("calls onChange(true) when clicked while disabled", async () => {
    const onChange = jest.fn();
    render(<EnabledToggle enabled={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not call onChange when the button is disabled", async () => {
    const onChange = jest.fn();
    render(<EnabledToggle enabled={true} onChange={onChange} disabled />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("is a disabled button when the disabled prop is set", () => {
    render(<EnabledToggle enabled={true} onChange={jest.fn()} disabled />);
    expect(screen.getByRole("switch")).toBeDisabled();
  });
});
