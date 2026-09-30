import { supabase } from "./supabase";
import type { MainCategory, SubCategory } from "./types/categories";

export type ProjectRow = {
  id: number;
  title: string;
  category?: string;
  main_category_id: number | null;
  sub_category_id: number | null;
  description: string;
  link: string;
  image_url: string;
  color: string;
  is_featured: boolean;
  sort_order: number;
  main_categories?: MainCategory | null;
  sub_categories?: SubCategory | null;
};

export async function getProjects() {
  try {
    const { data: projects } = await supabase
      .from("projects_new")
      .select(
        `*, main_categories!projects_new_main_category_id_fkey (id, name, color, sort_order), sub_categories!projects_new_sub_category_id_fkey (id, name, color, sort_order)`
      )
      .order("sort_order", { ascending: true });

    const { data: mainCategories } = await supabase
      .from("main_categories")
      .select("*")
      .order("sort_order", { ascending: true });

    return {
      projects: (projects ?? []) as ProjectRow[],
      mainCategories: mainCategories ?? [],
    };
  } catch {
    return {
      projects: [],
      mainCategories: [],
    };
  }
}
