import { beforeEach, describe, expect, it, vi } from "vitest";
import toast from "react-hot-toast";
import { ApiRequestError } from "@/lib/api";
import { useAuthStore } from "./store";
import * as authApi from "./api";

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
  },
}));

vi.mock("./api", async () => {
  const actual = await vi.importActual<typeof import("./api")>("./api");
  return {
    ...actual,
    getCurrentUser: vi.fn(),
  };
});

const mockUser = {
  id: 1,
  username: "demo",
  email: "demo@example.com",
  name: "Demo",
  is_staff: false,
  is_active: true,
  date_joined: "2025-01-01T00:00:00Z",
};

describe("auth session recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it("forces logout when backend does not respond", async () => {
    vi.mocked(authApi.getCurrentUser).mockRejectedValueOnce(
      new ApiRequestError("network", {
        method: "GET",
        url: "http://localhost:8000/api/v1/users/me/",
        isNetworkError: true,
      }),
    );

    useAuthStore.setState({
      user: mockUser,
      accessToken: "token",
      refreshToken: "refresh",
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    await useAuthStore.getState().initializeSession();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("forces logout on 401", async () => {
    vi.mocked(authApi.getCurrentUser).mockRejectedValueOnce(
      new ApiRequestError("unauthorized", {
        method: "GET",
        url: "http://localhost:8000/api/v1/users/me/",
        status: 401,
      }),
    );

    useAuthStore.setState({
      user: mockUser,
      accessToken: "token",
      refreshToken: "refresh",
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    await useAuthStore.getState().initializeSession();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("shows session recovery message only once", async () => {
    vi.mocked(authApi.getCurrentUser).mockRejectedValue(
      new ApiRequestError("network", {
        method: "GET",
        url: "http://localhost:8000/api/v1/users/me/",
        isNetworkError: true,
      }),
    );

    useAuthStore.setState({
      user: mockUser,
      accessToken: "token",
      refreshToken: "refresh",
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    await useAuthStore.getState().initializeSession();

    useAuthStore.setState({
      user: mockUser,
      accessToken: "token",
      refreshToken: "refresh",
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    await useAuthStore.getState().initializeSession();

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(
      "No se pudo recuperar tu sesión. Inicia sesión de nuevo.",
      { id: "session-recovery-error" },
    );
  });
});
