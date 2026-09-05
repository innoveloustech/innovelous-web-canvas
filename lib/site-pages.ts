import { supabase } from "./supabase";

export type SitePage = {
  id: number;
  slug: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export async function getSitePage(slug: string): Promise<SitePage | null> {
  const { data } = await supabase
    .from("site_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ?? null;
}
