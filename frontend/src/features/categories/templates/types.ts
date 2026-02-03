/**
 * Shared types for category layout templates.
 */

import { Category } from "../types";
import { Place } from "@/features/places/types";
import { Event } from "@/features/events/types";

/**
 * Props passed to all category layout components.
 * Data is fetched by CategoryDetailPage and passed to the layout.
 */
export interface CategoryLayoutProps {
  /** The category being displayed */
  category: Category;
  /** Places belonging to this category */
  places: Place[];
  /** Events belonging to this category */
  events: Event[];
  /** Whether places are currently being fetched */
  isLoadingPlaces: boolean;
  /** Whether events are currently being fetched */
  isLoadingEvents: boolean;
}
