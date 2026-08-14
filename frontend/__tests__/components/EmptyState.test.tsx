import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "@/components/EmptyState";

describe("EmptyState", () => {
  it("renders the 'No links yet' heading", () => {
    render(<EmptyState onCreateClick={jest.fn()} />);
    expect(screen.getByRole("heading", { name: /no links yet/i })).toBeInTheDocument();
  });

  it("renders a create link button", () => {
    render(<EmptyState onCreateClick={jest.fn()} />);
    expect(screen.getByRole("button", { name: /create a link/i })).toBeInTheDocument();
  });

  it("calls onCreateClick when the button is clicked", async () => {
    const onCreateClick = jest.fn();
    render(<EmptyState onCreateClick={onCreateClick} />);
    await userEvent.click(screen.getByRole("button", { name: /create a link/i }));
    expect(onCreateClick).toHaveBeenCalledTimes(1);
  });
});
