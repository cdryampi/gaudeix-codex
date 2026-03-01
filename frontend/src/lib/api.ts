const rawBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

type ApiRequestErrorOptions = {
  method: string;
  url: string;
  status?: number;
  isNetworkError?: boolean;
  data?: unknown;
};

export class ApiRequestError extends Error {
  readonly method: string;
  readonly url: string;
  readonly status?: number;
  readonly isNetworkError: boolean;
  readonly data?: unknown;

  constructor(message: string, options: ApiRequestErrorOptions) {
    super(message);
    this.name = "ApiRequestError";
    this.method = options.method;
    this.url = options.url;
    this.status = options.status;
    this.isNetworkError = options.isNetworkError ?? false;
    this.data = options.data;
  }
}

function normalizeApiBaseUrl(value: string): string {
  const trimmed = value.replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) return `${trimmed}/v1`;
  return trimmed;
}

export function getValidBaseUrl(url: string | undefined): string {
  const fallbackUrl = "http://localhost:8000/api/v1";

  if (!url) {
    // eslint-disable-next-line no-console
    console.error(
      "VITE_API_BASE_URL is not defined. Falling back to default: " + fallbackUrl
    );
    return fallbackUrl;
  }

  try {
    new URL(url);
    return normalizeApiBaseUrl(url);
  } catch {
    // eslint-disable-next-line no-console
    console.error(
      `VITE_API_BASE_URL is invalid: "${url}". Falling back to default: ` + fallbackUrl
    );
    return fallbackUrl;
  }
}

export const API_BASE_URL = getValidBaseUrl(rawBaseUrl);

function getUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function parseErrorBody(resp: Response): Promise<unknown> {
  const text = await resp.text().catch(() => "");
  if (!text) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function requestJson<T>(
  path: string,
  method: string,
  init?: RequestInit,
  data?: unknown,
): Promise<T> {
  const url = getUrl(path);

  let resp: Response;
  try {
    resp = await fetch(url, {
      method,
      ...init,
      headers: {
        Accept: "application/json",
        ...(data !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers ?? {}),
      },
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  } catch (error) {
    throw new ApiRequestError(`Network error on ${method} ${url}`, {
      method,
      url,
      isNetworkError: true,
      data: error,
    });
  }

  if (!resp.ok) {
    const errorData = await parseErrorBody(resp);
    throw new ApiRequestError(`${method} ${url} failed (${resp.status})`, {
      method,
      url,
      status: resp.status,
      data: errorData,
    });
  }

  if (resp.status === 204) return {} as T;

  return (await resp.json()) as T;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  return requestJson<T>(path, init?.method || "GET", init);
}

export async function apiPost<T>(
  path: string,
  data: unknown,
  init?: RequestInit,
): Promise<T> {
  return requestJson<T>(path, init?.method || "POST", init, data);
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
