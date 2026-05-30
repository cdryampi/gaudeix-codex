import client from "@/lib/api/client";
import type {
  Accommodation,
  AccommodationPayload,
  AccommodationUpdatePayload,
} from "../types";

export const accommodationsApi = {
  async getAll(params?: { search?: string; is_published?: string }) {
    const { data } = await client.get<Accommodation[]>("/accommodations/", {
      params,
    });
    return data.map(normalizeAccommodation);
  },

  async create(payload: AccommodationPayload) {
    const { data } = await client.post<Accommodation>(
      "/accommodations/",
      payload,
    );
    return normalizeAccommodation(data);
  },

  async update(slug: string, payload: AccommodationUpdatePayload) {
    const { data } = await client.patch<Accommodation>(
      `/accommodations/${slug}/`,
      payload,
    );
    return normalizeAccommodation(data);
  },

  async delete(slug: string) {
    await client.delete(`/accommodations/${slug}/`);
  },
};

function normalizeAccommodation(a: Accommodation): Accommodation {
  return {
    ...a,
    description: a.description || "",
    location_text: a.location_text || "",
    featured_media: a.featured_media ?? null,
    attachments: a.attachments || [],
    amenities: a.amenities ?? {},
  };
}
