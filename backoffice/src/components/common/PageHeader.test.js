import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect } from "vitest";
import { render, screen } from "@/tests/test-utils";
import { PageHeader } from "@/components/common";
describe("PageHeader", () => {
    it("renders title", () => {
        render(_jsx(PageHeader, { title: "Test Title" }));
        expect(screen.getByText("Test Title")).toBeInTheDocument();
    });
    it("renders description when provided", () => {
        render(_jsx(PageHeader, { title: "Test", description: "Test description" }));
        expect(screen.getByText("Test description")).toBeInTheDocument();
    });
    it("renders actions when provided", () => {
        render(_jsx(PageHeader, { title: "Test", actions: _jsx("button", { children: "Action" }) }));
        expect(screen.getByText("Action")).toBeInTheDocument();
    });
});
