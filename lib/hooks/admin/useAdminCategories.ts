"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { MainCategory, SubCategory } from "@/lib/types/admin";

const key = ["admin", "categories"] as const;
const EMPTY_MAIN_CATEGORIES: MainCategory[] = [];
const EMPTY_SUB_CATEGORIES: SubCategory[] = [];

export function useAdminCategories() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: key,
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
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: key });
    void queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
  };
  const checkDependencies = async (kind: "main" | "sub", id: number) => {
    if (kind === "main") {
      const [{ data: subCategories }, { data: projects }] = await Promise.all([
        supabase.from("sub_categories").select("id").eq("main_category_id", id),
        supabase.from("projects_new").select("id").eq("main_category_id", id),
      ]);
      if (subCategories?.length) return { canDelete: false, reason: "This main category has sub-categories", dependentCount: subCategories.length, dependentType: "subcategories" as const };
      if (projects?.length) return { canDelete: false, reason: "This main category has projects assigned to it", dependentCount: projects.length, dependentType: "projects" as const };
    } else {
      const { data: projects } = await supabase.from("projects_new").select("id").eq("sub_category_id", id);
      if (projects?.length) return { canDelete: false, reason: "This sub-category has projects assigned to it", dependentCount: projects.length, dependentType: "projects" as const };
    }
    return { canDelete: true };
  };
  const saveMainCategory = async (id: number | undefined, values: Pick<MainCategory, "name" | "color" | "sort_order">) => {
    const result = id ? await supabase.from("main_categories").update(values).eq("id", id) : await supabase.from("main_categories").insert([values]);
    if (result.error) throw result.error;
    invalidate();
  };
  const saveSubCategory = async (id: number | undefined, values: Pick<SubCategory, "main_category_id" | "name" | "color" | "sort_order">) => {
    const result = id ? await supabase.from("sub_categories").update(values).eq("id", id) : await supabase.from("sub_categories").insert([values]);
    if (result.error) throw result.error;
    invalidate();
  };
  const deleteCategory = async (kind: "main" | "sub", id: number) => {
    const { error } = await supabase.from(kind === "main" ? "main_categories" : "sub_categories").delete().eq("id", id);
    if (error) throw error;
    invalidate();
  };
  const reorderCategories = async (kind: "main" | "sub", items: Pick<MainCategory, "id" | "sort_order">[]) => {
    const table = kind === "main" ? "main_categories" : "sub_categories";
    const results = await Promise.all(items.map((item) => supabase.from(table).update({ sort_order: item.sort_order }).eq("id", item.id)));
    const error = results.find((result) => result.error)?.error;
    if (error) throw error;
    invalidate();
  };
  return {
    ...query,
    mainCategories: query.data?.mainCategories ?? EMPTY_MAIN_CATEGORIES,
    subCategories: query.data?.subCategories ?? EMPTY_SUB_CATEGORIES,
    refreshCategories: invalidate,
    checkCategoryDependencies: checkDependencies,
    saveMainCategory,
    saveSubCategory,
    deleteCategory,
    reorderCategories,
  };
}
