import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import App from "./App";
describe("App", () => {
    it("renders without crashing", () => {
        render(_jsx(App, {}));
        // Simple test to verify the component renders
        expect(document.body).toBeTruthy();
    });
});
