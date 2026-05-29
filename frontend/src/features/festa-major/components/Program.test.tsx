import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Program } from "./Program";

describe("Program", () => {
  it("renders the program shell", () => {
    render(<Program />);

    expect(screen.getByTestId("festa-major-program")).toBeInTheDocument();
  });
});
