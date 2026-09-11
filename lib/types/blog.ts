export interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  cover_image: string | null;
  published_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  cover_image: string;
  published_at: string | null;
  sort_order: number;
}
