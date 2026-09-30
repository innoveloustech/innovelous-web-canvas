import { supabase } from './supabase';
import type { Solution } from './types/solutions';

export const FALLBACK_SOLUTIONS: Record<string, Solution> = {
  software: {
    id: "software",
    slug: "software",
    label: "02 // SOFTWARE",
    category: "Software & Digital Engineering",
    title: "Digital Ecosystems.",
    description: "End-to-end digital engineering. We build high-performance web platforms, native mobile applications, and enterprise AI pipelines that scale seamlessly with your business logic.",
    stats: [
      { value: "<0.1s", label: "Response Time" },
      { value: "100", label: "Lighthouse Score" },
      { value: "24/7", label: "Global Edge Delivery" },
    ],
    features: [
      "Web & Mobile App Engineering",
      "AI Integration & LLM Pipelines",
      "Custom Microservices Architecture",
      "UI/UX Design Systems",
      "Cloud Infrastructure & DevOps",
      "Enterprise API Integration",
      "Machine Learning Models",
      "Database Optimization & Security",
    ],
    cta_text: "Build Software",
    order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  hardware: {
    id: "hardware",
    slug: "hardware",
    label: "01 // HARDWARE",
    category: "Hardware & IoT Systems",
    title: "Connected Devices.",
    description: "Industrial-grade hardware engineering, embedded systems, firmware architecture, and seamless IoT cloud pipelines.",
    stats: [
      { value: "99.9%", label: "Uptime" },
      { value: "<5ms", label: "Latency" },
      { value: "ISO", label: "Certified" },
    ],
    features: [
      "Embedded Firmware & RTOS",
      "IoT Cloud Telemetry",
      "Custom PCB Architecture",
      "Edge Computing",
      "Industrial Sensors Integration",
      "Hardware Prototype & Testing",
    ],
    cta_text: "Engineer Hardware",
    order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export async function getSolutions(): Promise<Solution[]> {
  try {
    const { data, error } = await supabase
      .from('solutions')
      .select('*')
      .order('order', { ascending: true });

    if (error || !data || data.length === 0) {
      return Object.values(FALLBACK_SOLUTIONS);
    }
    return data as Solution[];
  } catch {
    return Object.values(FALLBACK_SOLUTIONS);
  }
}

export async function getSolutionBySlug(slug: string): Promise<Solution | null> {
  try {
    const { data, error } = await supabase
      .from('solutions')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return FALLBACK_SOLUTIONS[slug] || null;
    }
    return data as Solution;
  } catch {
    return FALLBACK_SOLUTIONS[slug] || null;
  }
}
