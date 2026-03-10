import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import userEvent from "@testing-library/user-event";

import { render, screen, waitFor } from "@/tests/test-utils";
import { BeachDialog } from "../components/BeachDialog";

vi.mock("@/components/ui/rich-text-editor", () => ({
  RichTextEditor: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }) => (
    <textarea
      aria-label={placeholder || "Rich text editor"}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

vi.mock("@/features/media/api/media", () => ({
  mediaApi: {
    listImages: vi.fn(),
    upload: vi.fn(),
  },
}));

const { mediaApi } = await import("@/features/media/api/media");

describe("BeachDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mediaApi.listImages as Mock).mockResolvedValue([]);
    (mediaApi.upload as Mock).mockResolvedValue(null);
  });

  it("submits beach-specific fields and translations", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <BeachDialog open={true} onOpenChange={vi.fn()} onSubmit={onSubmit} />,
    );

    await waitFor(() => {
      expect(mediaApi.listImages).toHaveBeenCalledTimes(1);
    });

    await user.type(screen.getByLabelText(/^Título$/i), "Platja Nova");
    await user.selectOptions(
      screen.getByLabelText(/tipo de playa/i),
      "natural",
    );
    await user.type(
      screen.getByLabelText(/resumen de entorno/i),
      "Tramo abierto y familiar",
    );
    await user.type(screen.getByLabelText(/longitud aproximada/i), "320");
    await user.type(screen.getByLabelText(/ubicación/i), "Passeig Marítim");
    await user.click(screen.getByLabelText("Familias"));
    await user.click(screen.getByLabelText("Duchas"));
    await user.click(screen.getByLabelText("Acceso accesible"));
    await user.click(screen.getByRole("button", { name: /español/i }));
    await user.type(
      screen.getByLabelText(/Título \(Español\)/i),
      "Playa Nueva",
    );
    await user.click(screen.getByRole("button", { name: /^Crear$/ }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Platja Nova",
          beach_type: "natural",
          location_text: "Passeig Marítim",
          length_m: 320,
          recommended_for: ["families"],
          services: { showers: true },
          accessibility_features: { accessible_access: true },
          translations: {
            es: {
              title: "Playa Nueva",
            },
          },
        }),
      );
    });
  });
});
