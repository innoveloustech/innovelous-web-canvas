"use client";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { Testimonial } from "@/lib/site-settings";

export default function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useGSAP(() => {
    if (wrapperRef.current) {
      gsap.from(wrapperRef.current.children, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power3.out",
      });
    }
  }, { scope: wrapperRef });

  const fetchTestimonials = async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setTestimonials(data);
    setLoading(false);
  };

  const updateField = (id: number, field: string, value: string | boolean) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      for (const t of testimonials) {
        const { error } = await supabase
          .from("testimonials")
          .update({ text: t.text, author: t.author, role: t.role, is_dark: t.is_dark })
          .eq("id", t.id);
        if (error) throw error;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save testimonials.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">Loading testimonials...</p>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">Testimonials</h1>
        <p className="text-neutral-500 text-sm font-light">
          Edit the 4 testimonial cards shown on the 3D rotating cube. Each card has text, author, role, and a dark/light theme toggle.
        </p>
      </div>

      <div className="space-y-6">
        {testimonials.map((t, i) => (
          <div key={t.id} className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-neutral-600">Face {i + 1}</span>
                <span className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 border rounded-full ${t.is_dark ? "border-neutral-600 text-neutral-400" : "border-yellow-500/30 text-yellow-400"}`}>
                  {t.is_dark ? "Dark" : "Light"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateField(t.id, "is_dark", !t.is_dark)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${t.is_dark ? "bg-neutral-700" : "bg-yellow-600/40"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${t.is_dark ? "left-0.5" : "translate-x-5"}`} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1.5">Testimonial Text</label>
                <textarea
                  value={t.text}
                  onChange={(e) => updateField(t.id, "text", e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1.5">Author</label>
                  <input
                    type="text"
                    value={t.author}
                    onChange={(e) => updateField(t.id, "author", e.target.value)}
                    className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1.5">Role</label>
                  <input
                    type="text"
                    value={t.role}
                    onChange={(e) => updateField(t.id, "role", e.target.value)}
                    className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-800 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition-colors flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            "Save All"
          )}
        </button>
        {saved && (
          <span className="text-emerald-400 text-xs font-mono flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Testimonials saved
          </span>
        )}
      </div>
    </div>
  );
}
