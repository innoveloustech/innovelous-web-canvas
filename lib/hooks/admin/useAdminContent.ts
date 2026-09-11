"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { FaqItem, SitePage, SiteSettings, Testimonial } from "@/lib/types/admin";

const keys = {
  faqs: ["admin", "faqs"] as const,
  testimonials: ["admin", "testimonials"] as const,
  settings: ["admin", "site-settings"] as const,
  privacy: ["admin", "privacy"] as const,
};

export function useAdminFaqs() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: keys.faqs,
    queryFn: async (): Promise<FaqItem[]> => {
      const { data, error } = await supabase.from("faqs").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
  const save = useMutation({
    mutationFn: async (items: FaqItem[]) => {
      for (const item of items) {
        const { error } = await supabase.from("faqs").update({ question: item.question, answer: item.answer }).eq("id", item.id);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.faqs }),
  });
  return { ...query, saveFaqs: save.mutateAsync, isSaving: save.isPending };
}

export function useAdminTestimonials() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: keys.testimonials,
    queryFn: async (): Promise<Testimonial[]> => {
      const { data, error } = await supabase.from("testimonials").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
  const save = useMutation({
    mutationFn: async (items: Testimonial[]) => {
      for (const item of items) {
        const { error } = await supabase.from("testimonials").update({ text: item.text, author: item.author, role: item.role, is_dark: item.is_dark }).eq("id", item.id);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.testimonials }),
  });
  return { ...query, saveTestimonials: save.mutateAsync, isSaving: save.isPending };
}

export function useAdminSettings() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: keys.settings,
    queryFn: async (): Promise<SiteSettings | null> => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });
  const save = useMutation({
    mutationFn: async (values: Partial<SiteSettings>) => {
      const { error } = await supabase.from("site_settings").update({ ...values, updated_at: new Date().toISOString() }).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.settings }),
  });
  const upload = async (file: File, prefix: string) => {
    const ext = file.name.split(".").pop() || "bin";
    const name = `${prefix}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-assets").upload(name, file);
    if (error) throw error;
    return supabase.storage.from("site-assets").getPublicUrl(name).data.publicUrl;
  };
  const remove = async (url: string) => {
    const match = url.match(/\/object\/public\/site-assets\/(.+)$/);
    if (match) {
      const { error } = await supabase.storage.from("site-assets").remove([match[1]]);
      if (error) throw error;
    }
  };
  return { ...query, saveSettings: save.mutateAsync, uploadSettingsFile: upload, removeSettingsFile: remove, isSaving: save.isPending };
}

export function useAdminPrivacy() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: keys.privacy,
    queryFn: async (): Promise<SitePage> => {
      const { data, error } = await supabase.from("site_pages").select("*").eq("slug", "privacy").maybeSingle();
      if (error) throw error;
      if (data) return data;
      const { data: created, error: createError } = await supabase.from("site_pages").upsert({ slug: "privacy", title: "Privacy Policy", content: "" }).select().single();
      if (createError) throw createError;
      return created;
    },
  });
  const save = useMutation({
    mutationFn: async (values: Pick<SitePage, "title" | "content">) => {
      const { error } = await supabase.from("site_pages").upsert({ slug: "privacy", ...values, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.privacy }),
  });
  return { ...query, savePrivacy: save.mutateAsync, isSaving: save.isPending };
}
