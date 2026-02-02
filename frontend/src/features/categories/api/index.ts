import { apiGet } from "@/lib/api";
import { Category, CategoryListResponse } from "../types";

export const getCategories = async (
  params?: Record<string, any>,
): Promise<CategoryListResponse | Category[]> => {
  const queryString = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  return apiGet<CategoryListResponse | Category[]>(
    `/categories/${queryString}`,
  );
};

export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  const params = new URLSearchParams({ slug });
  const response = await apiGet<CategoryListResponse>(
    `/categories/?${params.toString()}`,
  );

  // Handle paginated response
  if (response.results && response.results.length > 0) {
    return response.results[0];
  }

  // Handle if API returns array directly (unlikely with DRF default pagination but possible)
  if (Array.isArray(response) && response.length > 0) {
    return (response as unknown as Category[])[0];
  }

  throw new Error("Category not found");
};
