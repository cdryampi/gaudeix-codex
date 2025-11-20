import { describe, it, expect } from "vitest";
import { render, screen } from "@/tests/test-utils";
import { PageHeader } from "@/components/common";

describe("PageHeader", () => {
  it("renders title", () => {
    render(<PageHeader title="Test Title" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<PageHeader title="Test" description="Test description" />);
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    render(<PageHeader title="Test" actions={<button>Action</button>} />);
    expect(screen.getByText("Action")).toBeInTheDocument();
  });
});
