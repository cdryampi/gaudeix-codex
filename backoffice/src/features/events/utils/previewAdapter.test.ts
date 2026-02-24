import { describe, it, expect } from "vitest";
import { mapFormToPreviewEvent } from "./previewAdapter";
import { CreateEventDTO } from "../types";

describe("previewAdapter", () => {
  const mockCategories = [{ id: 1, nombre: "Cultura", slug: "cultura" }];
  const mockTags = [{ id: 10, nombre: "Música", slug: "musica" }];
  const mockImages = [
    { id: 100, original_name: "hero.jpg", file: "/media/hero.jpg", type: "image" as const, mime_type: "image/jpeg", size_bytes: 1024 }
  ];
  const mockDocs = [
    { id: 200, original_name: "programa.pdf", file: "/media/prog.pdf", type: "document" as const, mime_type: "application/pdf", size_bytes: 2048 }
  ];

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
    dates: [{ start_at: "2026-01-01T10:00:00Z" }]
  };

  it("should map basic form data correctly", () => {
    const result = mapFormToPreviewEvent(baseForm, {
      categories: mockCategories as any,
      tags: mockTags as any,
      images: mockImages as any,
      documents: mockDocs as any,
      activeLang: "ca",
      dates: baseForm.dates!
    });

    expect(result.title).toBe("Evento Test");
    expect(result.category_name).toBe("Cultura");
    expect((result.tags?.[0] as any).name).toBe("Música"); // Check mapping nombre -> name
    expect((result.attachments?.[0] as any).title).toBe("programa.pdf"); // Check mapping original_name -> title
    expect(result.featured_media?.file).toBe("/media/hero.jpg");
  });

  it("should handle translations based on activeLang", () => {
    const formWithTrans: CreateEventDTO = {
      ...baseForm,
      translations: {
        es: { title: "Evento en Español" }
      }
    };

    const result = mapFormToPreviewEvent(formWithTrans, {
      categories: mockCategories as any,
      tags: mockTags as any,
      images: mockImages as any,
      documents: mockDocs as any,
      activeLang: "es",
      dates: baseForm.dates!
    });

    expect(result.title).toBe("Evento en Español");
  });

  it("should generate synthetic IDs for dates without ID", () => {
    const result = mapFormToPreviewEvent(baseForm, {
      categories: mockCategories as any,
      tags: mockTags as any,
      images: mockImages as any,
      documents: mockDocs as any,
      activeLang: "ca",
      dates: baseForm.dates!
    });

    expect(result.dates?.[0].id).toBe(-1);
  });
});
