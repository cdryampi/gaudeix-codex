import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { CreateSocialLinkDTO, SocialLink } from "../types";

const iconSuggestions = [
  "fa-brands fa-facebook",
  "fa-brands fa-instagram",
  "fa-brands fa-x-twitter",
  "fa-brands fa-linkedin",
  "fa-brands fa-youtube",
  "fa-brands fa-tiktok",
  "fa-brands fa-telegram",
  "fa-brands fa-whatsapp",
  "fa-regular fa-envelope",
];

const emptyForm: CreateSocialLinkDTO = {
  name: "",
  url: "",
  icon_class: "",
  color: "#000000",
  available_in_ca: true,
  available_in_es: true,
  available_in_en: true,
  available_in_fr: false,
  order: 0,
  is_active: true,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSocialLinkDTO) => void;
  link?: SocialLink;
};

export function SocialLinkDialog({
  open,
  onOpenChange,
  onSubmit,
  link,
}: Props) {
  const [formData, setFormData] = useState<CreateSocialLinkDTO>(emptyForm);

  useEffect(() => {
    if (link) {
      const { id, ...rest } = link;
      setFormData(rest);
    } else {
      setFormData(emptyForm);
    }
  }, [link, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleToggle =
    (name: keyof CreateSocialLinkDTO) => (checked: boolean) => {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] px-6">
        <DialogHeader>
          <DialogTitle>{link ? "Editar enlace" : "Nuevo enlace"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <div className="w-full">
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Orden</Label>
              <div className="w-full">
                <Input
                  id="order"
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={handleChange}
                  className="w-full"
                  min={0}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <div className="w-full">
              <Input
                id="url"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="icon_class">Icono (clase)</Label>
              <div className="w-full">
                <Input
                  id="icon_class"
                  name="icon_class"
                  list="icon-suggestions"
                  placeholder="fa-brands fa-facebook"
                  value={formData.icon_class}
                  onChange={handleChange}
                  className="w-full"
                  required
                />
              </div>
              <datalist id="icon-suggestions">
                {iconSuggestions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground">
                Escribe la clase de FontAwesome o elige una sugerencia.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="h-11 w-16 min-w-[64px]"
                />
                <Input
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleRow
              label="Activo"
              checked={formData.is_active}
              onCheckedChange={handleToggle("is_active")}
            />
            <ToggleRow
              label="Disponible CA"
              checked={formData.available_in_ca}
              onCheckedChange={handleToggle("available_in_ca")}
            />
            <ToggleRow
              label="Disponible ES"
              checked={formData.available_in_es}
              onCheckedChange={handleToggle("available_in_es")}
            />
            <ToggleRow
              label="Disponible EN"
              checked={formData.available_in_en}
              onCheckedChange={handleToggle("available_in_en")}
            />
            <ToggleRow
              label="Disponible FR"
              checked={formData.available_in_fr}
              onCheckedChange={handleToggle("available_in_fr")}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              {link ? "Guardar cambios" : "Crear enlace"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type ToggleRowProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function ToggleRow({ label, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}
