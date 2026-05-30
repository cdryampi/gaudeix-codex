import client from "@/lib/api/client";
import type {
  Restaurant,
  RestaurantPayload,
  RestaurantUpdatePayload,
} from "../types";

export const restaurantsApi = {
  async getAll(params?: { search?: string; is_published?: string }) {
    const { data } = await client.get<Restaurant[]>("/restaurants/", {
      params,
    });
    return data.map(normalizeRestaurant);
  },

  async create(payload: RestaurantPayload) {
    const { data } = await client.post<Restaurant>("/restaurants/", payload);
    return normalizeRestaurant(data);
  },

  async update(slug: string, payload: RestaurantUpdatePayload) {
    const { data } = await client.patch<Restaurant>(
      `/restaurants/${slug}/`,
      payload,
    );
    return normalizeRestaurant(data);
  },

  async delete(slug: string) {
    await client.delete(`/restaurants/${slug}/`);
  },
};

function normalizeRestaurant(r: Restaurant): Restaurant {
  return {
    ...r,
    description: r.description || "",
    location_text: r.location_text || "",
    featured_media: r.featured_media ?? null,
    attachments: r.attachments || [],
    amenities: r.amenities ?? {},
  };
}
