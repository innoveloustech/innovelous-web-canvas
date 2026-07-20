import Home from '@/screens/Home'
import { supabase } from '@/lib/supabase'

async function getFeaturedProjects() {
  const { data } = await supabase
    .from("projects_new")
    .select("*")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true });

  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.title,
    tagline: p.category,
    description: p.description,
    tags: [p.category],
    image_url: p.image_url,
    link: p.link,
    color: p.color,
  }));
}

export default async function Page() {
  const projects = await getFeaturedProjects();
  return <Home projects={projects} />
}
