import { supabase } from "./supabase";
import type { Blog } from "./types/blog";

export async function getPublishedBlogs(): Promise<Blog[]> {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false });

    if (error) {
      return [];
    }

    return (data as Blog[]) ?? [];
  } catch {
    return [];
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      return null;
    }

    return (data as Blog | null) ?? null;
  } catch {
    return null;
  }
}

export async function getAllBlogSlugs(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("slug")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString());

    if (error) {
      return [];
    }

    return ((data as { slug: string }[]) ?? []).map((item) => item.slug);
  } catch {
    return [];
  }
}
