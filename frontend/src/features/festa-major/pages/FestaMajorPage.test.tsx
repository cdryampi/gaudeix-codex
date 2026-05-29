import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { FestaMajorPage } from "./FestaMajorPage";

describe("FestaMajorPage", () => {
  it("renders the page shell", () => {
    render(<FestaMajorPage />);

    expect(screen.getByTestId("festa-major-page")).toBeInTheDocument();
  });
});
