import { Category } from "@/features/categories/types";
import { StaticPage } from "@/features/static-pages/types";

export type MenuLocation = "header" | "footer";

export type MenuItemType = "category" | "static_page" | "custom";

export type MenuItem = {
  id: number;
  location: MenuLocation;
  parent?: number | null;
  order: number;
  type: MenuItemType;
  label: string;
  url: string;
  category?: Category | null;
  category_id?: number | null;
  static_page?: StaticPage | null;
  static_page_id?: number | null;
};

export type MenuItemPayload = Partial<MenuItem>;

