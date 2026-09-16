export interface Solution {
  id: string;
  slug: string;
  label: string;
  category: string;
  title: string;
  description: string;
  stats: { value: string; label: string }[];
  features: string[];
  cta_text: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export type SolutionFormData = Omit<Solution, 'id' | 'created_at' | 'updated_at'>;
