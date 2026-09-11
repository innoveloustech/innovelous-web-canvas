"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { MainCategory, Project, SubCategory } from "@/lib/types/admin";

const projectsKey = ["admin", "projects"] as const;
const categoriesKey = ["admin", "categories"] as const;
const EMPTY_PROJECTS: Project[] = [];
const EMPTY_MAIN_CATEGORIES: MainCategory[] = [];
const EMPTY_SUB_CATEGORIES: SubCategory[] = [];

export function useAdminProjects() {
  const queryClient = useQueryClient();
  const projects = useQuery({
    queryKey: projectsKey,
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase.from("projects_new").select(`
        *,
        main_categories!projects_new_main_category_id_fkey (id, name, color, sort_order),
        sub_categories!projects_new_sub_category_id_fkey (id, name, color, sort_order)
      `).order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
  const categories = useQuery({
    queryKey: categoriesKey,
    queryFn: async (): Promise<{ mainCategories: MainCategory[]; subCategories: SubCategory[] }> => {
      const [{ data: mainCategories, error: mainError }, { data: subCategories, error: subError }] = await Promise.all([
        supabase.from("main_categories").select("*").order("sort_order", { ascending: true }),
        supabase.from("sub_categories").select("*").order("sort_order", { ascending: true }),
      ]);
      if (mainError) throw mainError;
      if (subError) throw subError;
      return { mainCategories: mainCategories ?? [], subCategories: subCategories ?? [] };
    },
  });
  const settings = useQuery({
    queryKey: ["admin", "site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("show_featured").eq("id", 1).single();
      if (error) throw error;
      return data.show_featured;
    },
  });
  const queryClientRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: projectsKey });
    void queryClient.invalidateQueries({ queryKey: categoriesKey });
  };
  const uploadProjectImage = async (file: File, path: string) => {
    const { error } = await supabase.storage.from("projects_new-images").upload(path, file);
    if (error) throw error;
    return supabase.storage.from("projects_new-images").getPublicUrl(path).data.publicUrl;
  };
  const removeProjectImage = async (path: string) => {
    const { error } = await supabase.storage.from("projects_new-images").remove([path]);
    if (error) throw error;
  };
  const saveProject = async (id: number | undefined, values: Record<string, unknown>) => {
    const result = id ? await supabase.from("projects_new").update(values).eq("id", id) : await supabase.from("projects_new").insert([values]);
    if (result.error) throw result.error;
    queryClientRefresh();
  };
  const deleteProject = async (id: number) => {
    const { error } = await supabase.from("projects_new").delete().eq("id", id);
    if (error) throw error;
    queryClientRefresh();
  };
  const reorderProjects = async (items: Pick<Project, "id" | "sort_order">[]) => {
    const results = await Promise.all(items.map((item) => supabase.from("projects_new").update({ sort_order: item.sort_order }).eq("id", item.id)));
    const error = results.find((result) => result.error)?.error;
    if (error) throw error;
    queryClientRefresh();
  };
  const updateFeaturedVisibility = async (value: boolean) => {
    const { error } = await supabase.from("site_settings").update({ show_featured: value }).eq("id", 1);
    if (error) throw error;
    void queryClient.invalidateQueries({ queryKey: ["admin", "site-settings"] });
  };
  return {
    ...projects,
    projects: projects.data ?? EMPTY_PROJECTS,
    mainCategories: categories.data?.mainCategories ?? EMPTY_MAIN_CATEGORIES,
    subCategories: categories.data?.subCategories ?? EMPTY_SUB_CATEGORIES,
    showFeatured: settings.data ?? true,
    refreshAdminProjects: queryClientRefresh,
    uploadProjectImage,
    removeProjectImage,
    saveProject,
    deleteProject,
    reorderProjects,
    updateFeaturedVisibility,
  };
}
