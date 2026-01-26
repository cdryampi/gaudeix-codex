export const TEMPLATE_OPTIONS = [
  {
    value: "info_point",
    label: "Punt d'informació",
    description: "Punto de información / landing de acogida",
  },
  {
    value: "privacy",
    label: "Política de privacitat",
    description: "Política de privacidad",
  },
  {
    value: "legal_notice",
    label: "Avís legal",
    description: "Aviso legal y condiciones de uso",
  },
  {
    value: "cookies",
    label: "Política de cookies",
    description: "Información y gestión de cookies",
  },
  { value: "contact", label: "Contacte", description: "Página de contacto" },
  {
    value: "inclusion",
    label: "Diversitat i inclusió",
    description: "Compromiso de inclusión y accesibilidad",
  },
];
export const TEMPLATE_LABEL_MAP = Object.fromEntries(
  TEMPLATE_OPTIONS.map((opt) => [opt.value, opt.label]),
);
