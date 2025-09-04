import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("affiche le label", () => {
    render(<Button label="Test" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("appelle onClick lors du clic", () => {
    const onClick = jest.fn();
    render(<Button label="Test" onClick={onClick} />);
    fireEvent.click(screen.getByText("Test"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("est désactivé quand disabled=true", () => {
    render(<Button label="Test" disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("a le bon type", () => {
    render(<Button label="Test" type="submit" />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
