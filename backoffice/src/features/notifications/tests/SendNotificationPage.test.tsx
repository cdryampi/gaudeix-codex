import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/tests/test-utils";
import { SendNotificationPage } from "../pages/SendNotificationPage";

// Mock API
vi.mock("../api", () => ({
  getNotificationHistory: vi
    .fn()
    .mockResolvedValue([
      {
        id: 1,
        title: "Test Notification",
        sent_at: "2024-01-01",
        recipient_count: 100,
        status: "sent",
      },
    ]),
  sendNotification: vi.fn().mockResolvedValue(true),
}));

describe("SendNotificationPage", () => {
  it("renders the form and history", async () => {
    render(<SendNotificationPage />);

    expect(screen.getByText("Push Notifications")).toBeInTheDocument();
    expect(screen.getByText("Nueva Campaña")).toBeInTheDocument();
    expect(screen.getByLabelText(/Título/i)).toBeInTheDocument();

    // Check for history item
    expect(await screen.findByText("Test Notification")).toBeInTheDocument();
  });
});
