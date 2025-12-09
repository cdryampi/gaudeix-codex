export type Category = {
  id: number;
  slug: string;
  taxonomy?: string;
  nombre: string;
  descripcion?: string;
  translations?: {
    [lang: string]: {
      nombre: string;
      descripcion?: string;
    };
  };
  created_at?: string;
  updated_at?: string;
};

export type CategoryPayload = {
  slug: string;
  taxonomy?: string;
  nombre: string;
  descripcion?: string;
  translations?: {
    [lang: string]: {
      nombre: string;
      descripcion?: string;
    };
  };
};

export type CategoryUpdatePayload = Partial<CategoryPayload>;
