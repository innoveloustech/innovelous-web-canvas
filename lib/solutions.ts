import { supabase } from './supabase';
import type { Solution } from './types/solutions';

export async function getSolutions(): Promise<Solution[]> {
  const { data, error } = await supabase
    .from('solutions')
    .select('*')
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching solutions:', error);
    return [];
  }
  return data as Solution[];
}

export async function getSolutionBySlug(slug: string): Promise<Solution | null> {
  const { data, error } = await supabase
    .from('solutions')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching solution ${slug}:`, error);
    return null;
  }
  return data as Solution;
}
