export type Tag = {
  id: number;
  slug: string;
  nombre: string;
  translations?: {
    [lang: string]: {
      nombre: string;
    };
  };
  created_at?: string;
  updated_at?: string;
};

export type TagPayload = {
  slug: string;
  nombre: string;
  translations?: {
    [lang: string]: {
      nombre: string;
    };
  };
};

export type TagUpdatePayload = Partial<TagPayload>;

