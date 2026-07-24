"use client";
import React, { createContext, useContext } from "react";
import type { SiteSettings, Testimonial, FaqItem } from "@/lib/site-settings";
import { DEFAULT_SETTINGS } from "@/lib/site-settings";

type SiteContextValue = {
  settings: SiteSettings;
  testimonials: Testimonial[];
  faqs: FaqItem[];
};

const SiteContext = createContext<SiteContextValue>({
  settings: DEFAULT_SETTINGS,
  testimonials: [],
  faqs: [],
});

export function useSiteSettings() {
  return useContext(SiteContext).settings;
}

export function useTestimonials() {
  return useContext(SiteContext).testimonials;
}

export function useFaqs() {
  return useContext(SiteContext).faqs;
}

export default function SiteSettingsProvider({
  settings,
  testimonials,
  faqs,
  children,
}: {
  settings: SiteSettings | null;
  testimonials: Testimonial[];
  faqs: FaqItem[];
  children: React.ReactNode;
}) {
  return (
    <SiteContext.Provider
      value={{
        settings: settings ?? DEFAULT_SETTINGS,
        testimonials,
        faqs,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}
