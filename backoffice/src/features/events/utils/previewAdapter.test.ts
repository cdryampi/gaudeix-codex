import { describe, it, expect } from "vitest";
import { mapFormToPreviewEvent } from "./previewAdapter";
import { CreateEventDTO } from "../types";
import type { Category } from "@/features/categories/types";
import type { Tag } from "@/features/tags/types";
import type { MediaItem } from "@/features/media/types";

describe("previewAdapter", () => {
  const mockCategories = [
    { id: 1, nombre: "Cultura", slug: "cultura" },
  ] as Category[];
  const mockTags = [{ id: 10, nombre: "Música", slug: "musica" }] as Tag[];
  const mockImages = [
    {
      id: 100,
      original_name: "hero.jpg",
      file: "/media/hero.jpg",
      type: "image" as const,
      mime_type: "image/jpeg",
      size_bytes: 1024,
    },
  ] as MediaItem[];
  const mockDocs = [
    {
      id: 200,
      original_name: "programa.pdf",
      file: "/media/prog.pdf",
      type: "document" as const,
      mime_type: "application/pdf",
      size_bytes: 2048,
    },
  ] as MediaItem[];

  const baseForm: CreateEventDTO = {
    title: "Evento Test",
    summary: "Resumen",
    description: "Descripción",
    category_id: 1,
    tag_ids: [10],
    featured_media_id: 100,
    attachments_ids: [200],
    venue_name: "Teatro",
    location_text: "Calle 123",
    is_free: true,
    dates: [{ start_at: "2026-01-01T10:00:00Z" }],
  };

  it("should map basic form data correctly", () => {
    const result = mapFormToPreviewEvent(baseForm, {
      categories: mockCategories,
      tags: mockTags,
      images: mockImages,
      documents: mockDocs,
      activeLang: "ca",
      dates: baseForm.dates!,
    });

    expect(result.title).toBe("Evento Test");
    expect(result.category_name).toBe("Cultura");
    expect((result.tags?.[0] as Record<string, unknown>).name).toBe("Música");
    expect((result.attachments?.[0] as Record<string, unknown>).title).toBe(
      "programa.pdf",
    );
    expect(result.featured_media?.file).toBe("/media/hero.jpg");
  });

  it("should handle translations based on activeLang", () => {
    const formWithTrans: CreateEventDTO = {
      ...baseForm,
      translations: {
        es: { title: "Evento en Español" },
      },
    };

    const result = mapFormToPreviewEvent(formWithTrans, {
      categories: mockCategories,
      tags: mockTags,
      images: mockImages,
      documents: mockDocs,
      activeLang: "es",
      dates: baseForm.dates!,
    });

    expect(result.title).toBe("Evento en Español");
  });

  it("should generate synthetic IDs for dates without ID", () => {
    const result = mapFormToPreviewEvent(baseForm, {
      categories: mockCategories,
      tags: mockTags,
      images: mockImages,
      documents: mockDocs,
      activeLang: "ca",
      dates: baseForm.dates!,
    });

    expect(result.dates?.[0].id).toBe(-1);
  });
});
