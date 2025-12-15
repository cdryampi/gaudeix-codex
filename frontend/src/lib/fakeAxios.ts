import { MOCK_API_GET } from "@/data/mockApi";

export type FakeAxiosResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: {
    url: string;
    method: "get";
  };
};

function normalizePath(value: string): string {
  if (!value) return "/";
  const trimmed = value.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      return new URL(trimmed).pathname + new URL(trimmed).search;
    } catch {
      return trimmed;
    }
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export const fakeAxios = {
  async get<T>(url: string): Promise<FakeAxiosResponse<T>> {
    const path = normalizePath(url);
    if (!(path in MOCK_API_GET)) {
      throw new Error(`fakeAxios: no mock for GET ${path}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 120));

    return {
      data: MOCK_API_GET[path] as T,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {
        url: path,
        method: "get",
      },
    };
  },
};
