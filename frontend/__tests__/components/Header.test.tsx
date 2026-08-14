import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/Header";

describe("Header", () => {
  it("renders the hook brand name", () => {
    render(<Header onCreateClick={jest.fn()} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/hook/i);
  });

  it("renders a 'New link' button", () => {
    render(<Header onCreateClick={jest.fn()} />);
    expect(screen.getByRole("button", { name: /new link/i })).toBeInTheDocument();
  });

  it("calls onCreateClick when the New link button is clicked", async () => {
    const onCreateClick = jest.fn();
    render(<Header onCreateClick={onCreateClick} />);
    await userEvent.click(screen.getByRole("button", { name: /new link/i }));
    expect(onCreateClick).toHaveBeenCalledTimes(1);
  });
});
