import { supabase } from './supabase';

export type SiteSettings = {
  id: number;
  email: string;
  phone: string;
  office_location: string;
  office_address: string;
  facebook_url: string;
  github_url: string;
  instagram_url: string;
  whatsapp_url: string;
  logo_url: string;
  favicon_url: string;
  og_image_url: string;
  show_featured: boolean;
  created_at: string;
  updated_at: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  email: 'info@innovelous.com',
  phone: '+92 333 2186309',
  office_location: 'Pakistan',
  office_address: 'DHA Phase 2 (Extension), Karachi',
  facebook_url: 'https://www.facebook.com/innoveloustech',
  github_url: 'https://github.com/innoveloustech',
  instagram_url: 'https://www.instagram.com/innoveloustech',
  whatsapp_url: 'https://wa.me/923349251936',
  logo_url: '/logo.png',
  favicon_url: '/favicon.ico',
  og_image_url: '/og-image.jpg',
  show_featured: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export type Testimonial = {
  id: number;
  text: string;
  author: string;
  role: string;
  is_dark: boolean;
  sort_order: number;
};

export type FaqItem = {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
};

const FAQ_DEFAULT_CLASSES = [
  "md:col-span-2 md:row-span-1",
  "md:col-span-1 md:row-span-1",
  "md:col-span-1 md:row-span-2",
  "md:col-span-2 md:row-span-1",
];

const FAQ_EXPANDED_CLASSES = [
  "md:col-span-3 md:row-span-2",
  "md:col-span-3 md:row-span-2",
  "md:col-span-3 md:row-span-2",
  "md:col-span-3 md:row-span-2",
];

export function getFaqDefaultClass(index: number) {
  return FAQ_DEFAULT_CLASSES[index] ?? "md:col-span-1 md:row-span-1";
}

export function getFaqExpandedClass(index: number) {
  return FAQ_EXPANDED_CLASSES[index] ?? "md:col-span-3 md:row-span-2";
}

export type SiteData = {
  settings: SiteSettings;
  testimonials: Testimonial[];
  faqs: FaqItem[];
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single();
  return data;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .order('sort_order', { ascending: true });
  return data || [];
}

export async function getFaqs(): Promise<FaqItem[]> {
  const { data } = await supabase
    .from('faqs')
    .select('*')
    .order('sort_order', { ascending: true });
  return data || [];
}

export async function getSiteData(): Promise<SiteData> {
  const [settings, testimonials, faqs] = await Promise.all([
    getSiteSettings(),
    getTestimonials(),
    getFaqs(),
  ]);
  return {
    settings: settings ?? DEFAULT_SETTINGS,
    testimonials,
    faqs,
  };
}
