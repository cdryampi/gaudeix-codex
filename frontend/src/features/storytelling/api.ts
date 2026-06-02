import { apiGet } from "@/lib/api";
import type { Story } from "./types";

type StoryListResponse = Story[] | { results: Story[] };

function normalizeStories(data: StoryListResponse): Story[] {
  return Array.isArray(data) ? data : data.results || [];
}

function buildQuery(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function listStories(params?: {
  search?: string;
  historical_period?: string;
  difficulty?: string;
}): Promise<Story[]> {
  const query = buildQuery({
    is_published: "true",
    search: params?.search,
    historical_period: params?.historical_period,
    difficulty: params?.difficulty,
  });
  const data = await apiGet<StoryListResponse>(`/stories/${query}`);
  return normalizeStories(data);
}

export async function getStory(slug: string): Promise<Story> {
  return apiGet<Story>(`/stories/${slug}/`);
}
