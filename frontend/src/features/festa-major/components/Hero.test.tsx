import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Hero } from "./Hero";

describe("Hero", () => {
  it("renders the hero shell", () => {
    render(<Hero />);

    expect(screen.getByTestId("festa-major-hero")).toBeInTheDocument();
  });
});
