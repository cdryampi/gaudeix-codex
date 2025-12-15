import { HEADER_NAV, type HeaderNavItem } from "./headerNav";
import { SAMPLE_FEATURED_EVENTS } from "@/features/events/sampleFeaturedEvents";

export type MockSiteSettings = {
  site_name: string;
  tagline: string;
};

export const MOCK_SITE_SETTINGS: MockSiteSettings = {
  site_name: "Gaudeix Cabrera de Mar",
  tagline: "Turisme i cultura a Cabrera de Mar",
};

export type MockMenuItemTree = {
  id: number;
  type: "category" | "static_page" | "custom";
  label: string;
  url: string;
  order: number;
  children?: MockMenuItemTree[];
};

function createIdFactory(start = 1) {
  let id = start;
  return () => id++;
}

function toMockMenuTree(items: HeaderNavItem[], nextId: () => number): MockMenuItemTree[] {
  return items.map((item, index) => ({
    id: nextId(),
    type: "custom",
    label: item.label,
    url: item.href || "#",
    order: index + 1,
    children: item.children?.length ? toMockMenuTree(item.children, nextId) : undefined,
  }));
}

export const MOCK_HEADER_MENU_TREE: MockMenuItemTree[] = toMockMenuTree(HEADER_NAV, createIdFactory());

export const MOCK_API_GET: Record<string, unknown> = {
  "/site-settings/": MOCK_SITE_SETTINGS,
  "/menu-items/tree/?location=header": MOCK_HEADER_MENU_TREE,
  "/events/featured/": SAMPLE_FEATURED_EVENTS,
};
