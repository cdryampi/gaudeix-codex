import { MOCK_API_GET } from "@/data/mockApi";

export type FakeAxiosResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: {
    url: string;
    method: "get" | "post";
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

  async post<T>(url: string, data: unknown): Promise<FakeAxiosResponse<T>> {
    const path = normalizePath(url);

    // Mock for login
    if (path === "/users/login/") {
      await new Promise((resolve) => setTimeout(resolve, 120));
      const credentials = data as { username: string; password: string };
      if (credentials.username && credentials.password) {
        return {
          data: {
            user: {
              id: 1,
              username: credentials.username,
              email: "test@example.com",
              name: "Usuario de prueba",
              is_staff: false,
              is_active: true,
              date_joined: new Date().toISOString(),
            },
            access: "mock_access_token",
            refresh: "mock_refresh_token",
          } as T,
          status: 200,
          statusText: "OK",
          headers: {},
          config: {
            url: path,
            method: "post",
          },
        };
      }
      throw new Error("Credenciales inválidas");
    }

    // Mock for registration
    if (path === "/users/") {
      await new Promise((resolve) => setTimeout(resolve, 120));
      const userData = data as { username: string; email: string; name: string; password: string };
      if (userData.username && userData.email && userData.name && userData.password) {
        return {
          data: {
            id: 2,
            username: userData.username,
            email: userData.email,
            name: userData.name,
            is_staff: false,
            is_active: true,
            date_joined: new Date().toISOString(),
          } as T,
          status: 201,
          statusText: "Created",
          headers: {},
          config: {
            url: path,
            method: "post",
          },
        };
      }
      throw new Error("Datos de registro incompletos");
    }

    // Mock for password reset
    if (path === "/users/password-reset/") {
      await new Promise((resolve) => setTimeout(resolve, 120));
      return {
        data: { detail: "If an account exists with this email, a password reset link has been sent." } as T,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {
          url: path,
          method: "post",
        },
      };
    }

    throw new Error(`fakeAxios: no mock for POST ${path}`);
  },
};
