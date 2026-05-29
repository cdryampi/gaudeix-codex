import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { EventCard } from "./EventCard";

describe("EventCard", () => {
  it("renders the event card shell", () => {
    render(<EventCard />);

    expect(screen.getByTestId("festa-major-event-card")).toBeInTheDocument();
  });
});
