import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@/tests/test-utils";
import { SendNotificationPage } from "../pages/SendNotificationPage";

vi.mock("../api", () => ({
  getNotificationHistory: vi.fn(),
  sendNotification: vi.fn().mockResolvedValue(true),
}));

import { getNotificationHistory } from "../api";

describe("SendNotificationPage", () => {
  beforeEach(() => {
    vi.mocked(getNotificationHistory).mockResolvedValue([
      {
        id: 1,
        title: "Test Notification",
        sent_at: "2024-01-01",
        recipient_count: 100,
        status: "sent",
      },
    ]);
  });

  it("renders campaign form and notification history", async () => {
    render(<SendNotificationPage />);

    expect(
      screen.getByRole("heading", { name: /push notifications/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /nueva campaña/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();

    expect(await screen.findByText("Test Notification")).toBeInTheDocument();
  });
});
