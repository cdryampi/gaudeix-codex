import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { getBeachBySlug, getBeaches } from "./api";

vi.mock("@/lib/api", () => ({
  apiGet: vi.fn(),
}));

const { apiGet } = await import("@/lib/api");

describe("beaches api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes a list response with nullable optional beach fields", async () => {
    (apiGet as Mock).mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          slug: "platja-dels-vinyals",
          title: "Platja dels Vinyals",
          description: null,
          location_text: null,
          phone: null,
          email: null,
          website: null,
          booking_url: null,
          environment_summary: null,
          access_notes: null,
          parking_info: null,
          public_transport_info: null,
          recommended_for: null,
          services: null,
          accessibility_features: null,
          gallery: null,
          attachments: null,
        },
      ],
    });

    const response = await getBeaches({ is_published: true });

    expect(apiGet).toHaveBeenCalledWith("/beaches/?is_published=true");
    expect(Array.isArray(response)).toBe(false);
    if (Array.isArray(response)) {
      throw new Error("Expected paginated response");
    }
    expect(response.results[0]).toMatchObject({
      description: "",
      location_text: "",
      phone: "",
      email: "",
      website: "",
      booking_url: "",
      environment_summary: "",
      access_notes: "",
      parking_info: "",
      public_transport_info: "",
      recommended_for: [],
      services: {},
      accessibility_features: {},
      gallery: [],
      attachments: [],
    });
  });

  it("normalizes a single beach response", async () => {
    (apiGet as Mock).mockResolvedValue({
      id: 2,
      slug: "platja-gran",
      title: "Platja Gran",
      description: null,
      location_text: null,
      phone: null,
      email: null,
      website: null,
      booking_url: null,
      environment_summary: null,
      access_notes: null,
      parking_info: null,
      public_transport_info: null,
      recommended_for: null,
      services: null,
      accessibility_features: null,
      gallery: null,
      attachments: null,
    });

    const beach = await getBeachBySlug("platja-gran");

    expect(apiGet).toHaveBeenCalledWith("/beaches/platja-gran/");
    expect(beach.description).toBe("");
    expect(beach.recommended_for).toEqual([]);
    expect(beach.services).toEqual({});
    expect(beach.gallery).toEqual([]);
  });
});
