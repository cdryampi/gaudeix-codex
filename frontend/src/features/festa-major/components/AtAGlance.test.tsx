import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AtAGlance } from "./AtAGlance";

describe("AtAGlance", () => {
  it("renders the at-a-glance shell", () => {
    render(<AtAGlance />);

    expect(screen.getByTestId("festa-major-at-a-glance")).toBeInTheDocument();
  });
});
