import Home from '@/screens/Home'
import { supabase } from '@/lib/supabase'

interface ProjectRow {
  id: number;
  title: string;
  category?: string;
  main_category_id: number | null;
  sub_category_id: number | null;
  main_categories?: { name: string; color: string } | null;
  sub_categories?: { name: string; color: string } | null;
  description: string;
  link: string;
  image_url: string;
  color: string;
  is_featured: boolean;
  sort_order: number;
}

async function getFeaturedProjects() {
  const { data } = await supabase
    .from("projects_new")
    .select(`
      *,
      main_categories!projects_new_main_category_id_fkey (name, color),
      sub_categories!projects_new_sub_category_id_fkey (name, color)
    `)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true });

  return (data || []).map((p: ProjectRow) => ({
    id: p.id,
    name: p.title,
    tagline: p.main_categories?.name || p.category || 'Uncategorized',
    description: p.description,
    tags: [p.main_categories?.name || p.category || 'Uncategorized'],
    image_url: p.image_url,
    link: p.link,
    color: p.main_categories?.color || p.color,
  }));
}

export default async function Page() {
  const projects = await getFeaturedProjects();
  return <Home projects={projects} />
}
