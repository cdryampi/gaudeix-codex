import { CreateEventDTO, Event, EventDate } from "../types";
import { Category } from "@/features/categories/types";
import { Tag } from "@/features/tags/types";
import { MediaItem } from "@/features/media/types";

/**
 * Adapter to map the Backoffice Event Form data (CreateEventDTO) 
 * to a full Event object compatible with the Frontend detail view.
 */
export function mapFormToPreviewEvent(
  form: CreateEventDTO,
  options: {
    categories: Category[];
    tags: Tag[];
    images: MediaItem[];
    documents: MediaItem[];
    activeLang: string;
    dates: EventDate[];
  }
): Event {
  const { categories, tags, images, documents, activeLang, dates } = options;

  // 1. Resolve basic translated fields based on activeLang
  let title = form.title;
  let summary = form.summary;
  let description = form.description;

  if (activeLang !== "ca" && form.translations?.[activeLang]) {
    const trans = form.translations[activeLang];
    title = trans.title || title;
    summary = trans.summary || summary;
    description = trans.description || description;
  }

  // 2. Resolve Category
  const category = categories.find((c) => c.id === form.category_id);

  // 3. Resolve Tags (mapping 'nombre' to 'name' for frontend compatibility)
  const resolvedTags = (form.tag_ids || [])
    .map((id) => {
      const tag = tags.find((t) => t.id === id);
      if (!tag) return null;
      
      // Map translations if activeLang is not 'ca'
      let name = tag.nombre;
      if (activeLang !== "ca" && tag.translations?.[activeLang]) {
        name = tag.translations[activeLang].nombre || name;
      }

      return {
        ...tag,
        name: name, // Frontend expects 'name'
      };
    })
    .filter((t): t is any => t !== null);

  // 4. Resolve Featured Media
  const featuredMedia = images.find((img) => img.id === form.featured_media_id);

  // 5. Resolve Attachments (mapping 'original_name' to 'title' for frontend compatibility)
  const attachments = (form.attachments_ids || [])
    .map((id) => {
      const doc = documents.find((d) => d.id === id);
      if (!doc) return null;
      return {
        ...doc,
        title: doc.original_name, // Frontend expects 'title'
      };
    })
    .filter((d): d is any => d !== null);

  // 6. Process Dates (ensure IDs for "Next Session" logic)
  const processedDates = dates.map((d, index) => ({
    ...d,
    id: d.id || -(index + 1), // Synthetic ID for new dates
  }));

  // 7. Determine primary start_at/end_at from the first session
  const firstSession = processedDates[0];

  return {
    id: 0, // Preview ID
    slug: "preview",
    title,
    summary,
    description,
    is_published: !!form.is_published,
    venue_name: form.venue_name,
    location_text: form.location_text,
    is_outdoor: !!form.is_outdoor,
    is_featured: !!form.is_featured,
    is_free: !!form.is_free,
    price: form.price,
    price_text: form.price_text,
    category: form.category_id,
    category_name: category?.nombre,
    category_slug: category?.slug,
    tags: resolvedTags,
    featured_media: featuredMedia ? {
      ...featuredMedia,
      variant_large: featuredMedia.variant_large || featuredMedia.file,
    } : null,
    attachments: attachments,
    dates: processedDates,
    start_at: firstSession?.start_at || new Date().toISOString(),
    end_at: firstSession?.end_at || null,
  };
}
