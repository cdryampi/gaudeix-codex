import { describe, expect, it } from "vitest";
import { render, screen } from "@/tests/test-utils";
import { PageHeader } from "@/components/common";

describe("PageHeader", () => {
  it("renders title as heading", () => {
    render(<PageHeader title="Test Title" />);
    expect(
      screen.getByRole("heading", { name: "Test Title" }),
    ).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<PageHeader title="Test" description="Test description" />);
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    render(
      <PageHeader
        title="Test"
        actions={<button type="button">Action</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });
});
