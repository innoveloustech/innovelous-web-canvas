import { supabase } from "./supabase";
import type { Blog } from "./types/blog";

export async function getPublishedBlogs(): Promise<Blog[]> {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching published blogs:", error.message);
    return [];
  }

  return (data as Blog[]) ?? [];
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching blog slug ${slug}:`, error.message);
    return null;
  }

  return (data as Blog | null) ?? null;
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from("blogs")
    .select("slug")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString());

  if (error) {
    console.error("Error fetching blog slugs:", error.message);
    return [];
  }

  return ((data as { slug: string }[]) ?? []).map((item) => item.slug);
}
