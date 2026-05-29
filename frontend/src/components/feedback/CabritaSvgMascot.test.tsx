import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CabritaPremiumMaintenance } from "./CabritaPremiumMaintenance";
import { CabritaSvgMascot } from "./CabritaSvgMascot";

describe("CabritaSvgMascot", () => {
  it("renders the generated goat sprite atlas as a decorative animated mascot", () => {
    const { container } = render(<CabritaSvgMascot />);

    expect(
      screen.getByLabelText("Cabrita animada de Cabrera de Mar"),
    ).toBeInTheDocument();
    expect(container.querySelector(".cabrita-sprite")).not.toBeNull();
    expect(container.querySelector(".cabrita-sprite-glow")).not.toBeNull();
  });

  it("uses a 12-frame CSS sprite loop and respects reduced motion", () => {
    const { container } = render(<CabritaSvgMascot />);
    const styleText = container.querySelector("style")?.textContent ?? "";

    expect(styleText).toContain("@keyframes cabrita-sprite-loop");
    expect(styleText).toContain("background-size: 1200% 100%");
    expect(styleText).toContain("step-end");
    expect(styleText).toContain("90.909% 0");
    expect(styleText).toContain("@media (prefers-reduced-motion: reduce)");
  });
});

describe("CabritaPremiumMaintenance", () => {
  it("keeps maintenance copy readable without virtual-pet control noise", () => {
    render(<CabritaPremiumMaintenance />);

    expect(
      screen.getByRole("heading", {
        name: "El portal de Cabrera està en manteniment",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pasturar/i })).toBeNull();
    expect(screen.queryByText(/MÃ|Â|Ã¨|Ã¯/)).toBeNull();
  });
});
