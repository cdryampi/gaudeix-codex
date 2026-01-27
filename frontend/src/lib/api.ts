const rawBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const useFakeAxios =
  (import.meta.env.VITE_USE_FAKE_AXIOS as string | undefined) === "true";

function normalizeApiBaseUrl(value: string): string {
  const trimmed = value.replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) return `${trimmed}/v1`;
  return trimmed;
}

export const API_BASE_URL = normalizeApiBaseUrl(
  rawBaseUrl || "http://localhost:8000/api/v1",
);

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (useFakeAxios) {
    const { fakeAxios } = await import("@/lib/fakeAxios");
    const resp = await fakeAxios.get<T>(normalizedPath);
    return resp.data;
  }

  const url = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  try {
    const resp = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`GET ${url} failed (${resp.status}): ${text}`);
    }
    return (await resp.json()) as T;
  } catch (err) {
    if (!import.meta.env.DEV) throw err;

    if (!(err instanceof TypeError)) {
      throw err;
    }

    const { fakeAxios } = await import("@/lib/fakeAxios");
    const resp = await fakeAxios.get<T>(normalizedPath);
    return resp.data;
  }
}

export async function apiPost<T>(
  path: string,
  data: unknown,
  init?: RequestInit,
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (useFakeAxios) {
    const { fakeAxios } = await import("@/lib/fakeAxios");
    const method = (init?.method || "POST").toLowerCase() as
      | "post"
      | "put"
      | "patch"
      | "delete";
    const resp = await (fakeAxios as any)[method](normalizedPath, data);
    return resp.data;
  }

  const url = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  try {
    const resp = await fetch(url, {
      method: "POST",
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      try {
        const json = JSON.parse(text);
        throw json;
      } catch {
        throw new Error(
          `${init?.method || "POST"} ${url} failed (${resp.status}): ${text}`,
        );
      }
    }
    // Handle 204 No Content
    if (resp.status === 204) return {} as T;
    return (await resp.json()) as T;
  } catch (err) {
    if (!import.meta.env.DEV) throw err;

    if (!(err instanceof TypeError)) {
      throw err;
    }

    const { fakeAxios } = await import("@/lib/fakeAxios");
    const method = (init?.method || "POST").toLowerCase() as
      | "post"
      | "put"
      | "patch"
      | "delete";
    const resp = await (fakeAxios as any)[method](normalizedPath, data);
    return resp.data;
  }
}

export async function apiDelete<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  return apiPost<T>(path, undefined, { ...init, method: "DELETE" });
}

export const api = {
  get: async <T>(path: string, init?: RequestInit) => {
    const data = await apiGet<T>(path, init);
    return { data };
  },
  post: async <T>(path: string, data: unknown, init?: RequestInit) => {
    const responseData = await apiPost<T>(path, data, init);
    return { data: responseData };
  },
  delete: async <T>(path: string, init?: RequestInit) => {
    const responseData = await apiDelete<T>(path, init);
    return { data: responseData };
  },
};
