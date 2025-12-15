export type FeaturedEvent = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  starts_at: string; // ISO 8601
  location: string;
  href?: string;
};

