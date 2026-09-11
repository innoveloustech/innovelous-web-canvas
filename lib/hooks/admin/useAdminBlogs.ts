"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Blog } from "@/lib/types/admin";

const key = ["admin", "blogs"] as const;
const EMPTY_BLOGS: Blog[] = [];
type BlogWriteData = Omit<Blog, "id" | "created_at" | "updated_at"> & { updated_at?: string };

export function useAdminBlogs() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: key,
    queryFn: async (): Promise<Blog[]> => {
      const { data, error } = await supabase.from("blogs").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
  const save = useMutation({
    mutationFn: async ({ id, values }: { id?: number; values: BlogWriteData }) => {
      const result = id
        ? await supabase.from("blogs").update(values).eq("id", id)
        : await supabase.from("blogs").insert([values]);
      if (result.error) throw result.error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
  const remove = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
  const reorder = useMutation({
    mutationFn: async (items: Pick<Blog, "id" | "sort_order">[]) => {
      const results = await Promise.all(items.map((item) => supabase.from("blogs").update({ sort_order: item.sort_order }).eq("id", item.id)));
      const error = results.find((result) => result.error)?.error;
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
  const uploadCover = async (file: File, fileName: string) => {
    const filePath = `blogs/${fileName}`;
    const { error } = await supabase.storage.from("site-assets").upload(filePath, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    return supabase.storage.from("site-assets").getPublicUrl(filePath).data.publicUrl;
  };
  const removeFiles = async (paths: string[]) => {
    if (!paths.length) return;
    const { error } = await supabase.storage.from("site-assets").remove(paths);
    if (error) throw error;
  };
  return {
    ...query,
    blogs: query.data ?? EMPTY_BLOGS,
    saveBlog: save.mutateAsync,
    deleteBlog: remove.mutateAsync,
    reorderBlogs: reorder.mutateAsync,
    uploadBlogCover: uploadCover,
    removeBlogFiles: removeFiles,
    isMutating: save.isPending || remove.isPending || reorder.isPending,
  };
}
