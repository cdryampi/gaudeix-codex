import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  default: {
    get: getMock,
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/lib/config/constants", () => ({
  API_ENDPOINTS: {
    EVENTS: {
      LIST: "/events/",
      DETAIL: (id: string) => `/events/${id}/`,
    },
  },
}));

import { eventsApi } from "./events";

describe("eventsApi.exportPdf", () => {
  let clickMock: ReturnType<typeof vi.fn>;
  let originalDocument: typeof globalThis.document | undefined;
  let originalWindow: typeof globalThis.window | undefined;

  beforeEach(() => {
    getMock.mockReset();
    getMock.mockResolvedValue({
      data: new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46])], {
        type: "application/pdf",
      }),
    });

    clickMock = vi.fn();
    originalDocument = globalThis.document;
    originalWindow = globalThis.window;

    const fakeLink = {
      href: "",
      setAttribute: vi.fn(),
      click: clickMock,
      remove: vi.fn(),
    };

    const fakeDocument = {
      body: {
        appendChild: vi.fn(),
      },
      createElement: vi.fn(() => fakeLink),
    } as unknown as typeof document;

    const fakeWindow = {
      URL: {
        createObjectURL: vi.fn(() => "blob:test-program"),
      },
    } as unknown as typeof window;

    Object.defineProperty(globalThis, "document", {
      value: fakeDocument,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, "window", {
      value: fakeWindow,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "document", {
      value: originalDocument,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      configurable: true,
      writable: true,
    });
  });

  it("maps format to paper_format and triggers the download flow", async () => {
    await eventsApi.exportPdf({
      start_date: "2026-03-06",
      end_date: "2026-03-31",
      category_slug: "culture",
      format: "A3",
    });

    expect(getMock).toHaveBeenCalledWith(
      expect.stringContaining("program-pdf/"),
      expect.objectContaining({
        params: {
          start_date: "2026-03-06",
          end_date: "2026-03-31",
          category_slug: "culture",
          paper_format: "A3",
        },
        responseType: "blob",
      }),
    );
    expect(clickMock).toHaveBeenCalledTimes(1);
  });
});
