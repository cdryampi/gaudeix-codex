import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiGet } from "@/lib/api";
import { listStories } from "./api";

vi.mock("@/lib/api", () => ({
  apiGet: vi.fn(),
}));

describe("storytelling API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests published stories without coordinate params", async () => {
    vi.mocked(apiGet).mockResolvedValue([]);

    await listStories();

    expect(apiGet).toHaveBeenCalledWith("/stories/?is_published=true");
  });
});
