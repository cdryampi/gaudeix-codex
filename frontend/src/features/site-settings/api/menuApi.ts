import { apiGet } from "@/lib/api";

export interface MenuTreeItem {
  id: number;
  label: string;
  url: string;
  type: "category" | "static_page" | "custom";
  order: number;
  category: { id: number; slug: string; nombre: string } | null;
  static_page: { id: number; slug: string; titulo: string } | null;
  children: MenuTreeItem[];
}

export async function getHeaderMenuTree(): Promise<MenuTreeItem[]> {
  return apiGet<MenuTreeItem[]>("/menu-items/tree/?location=header");
}
