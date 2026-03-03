import { describe, expect, it } from "vitest";
import { render, screen } from "@/tests/test-utils";
import App from "./App";

describe("App", () => {
  it("renders the backoffice shell information", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /gaudeix backoffice/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/panel administrativo listo/i)).toBeInTheDocument();
    expect(screen.getByText(/api base url/i)).toBeInTheDocument();
  });
});
