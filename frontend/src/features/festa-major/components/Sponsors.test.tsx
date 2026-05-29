import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Sponsors } from "./Sponsors";

describe("Sponsors", () => {
  it("renders the sponsors shell", () => {
    render(<Sponsors />);

    expect(screen.getByTestId("festa-major-sponsors")).toBeInTheDocument();
  });
});
