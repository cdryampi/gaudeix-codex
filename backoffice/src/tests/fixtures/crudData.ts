export const mockUsers = [
  {
    id: 1,
    username: "admin",
    email: "admin@gaudeix.com",
    name: "Admin User",
    is_staff: true,
    is_active: true,
    date_joined: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    username: "user",
    email: "user@gaudeix.com",
    name: "Regular User",
    is_staff: false,
    is_active: true,
    date_joined: "2023-01-02T00:00:00Z",
  },
] as const;

export const mockSocialLinks = [
  {
    id: 1,
    name: "Facebook",
    url: "https://facebook.com",
    icon_class: "fa-brands fa-facebook",
    color: "#3b5998",
    available_in_ca: true,
    available_in_es: true,
    available_in_en: true,
    available_in_fr: false,
    order: 1,
    is_active: true,
  },
  {
    id: 2,
    name: "Instagram",
    url: "https://instagram.com",
    icon_class: "fa-brands fa-instagram",
    color: "#E1306C",
    available_in_ca: true,
    available_in_es: true,
    available_in_en: true,
    available_in_fr: false,
    order: 2,
    is_active: false,
  },
] as const;
