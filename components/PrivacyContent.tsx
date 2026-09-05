"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PrivacyContent() {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_pages")
        .select("*")
        .eq("slug", "privacy")
        .maybeSingle();
      if (error) {
        console.error(error);
      } else if (data) {
        setHtml(data.content || "");
        if (data.updated_at) {
          const el = document.getElementById("privacy-last-updated");
          if (el) el.textContent = new Date(data.updated_at).toLocaleDateString();
        }
      } else {
        setHtml("");
      }
      setLoading(false);
    };
    void load();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div
        id="privacy-content"
        className="space-y-6 text-zinc-300 leading-relaxed prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style jsx>{`
        /* Fallback styles if Tailwind typography plugin isn't enabled */
        #privacy-content h1, #privacy-content h2, #privacy-content h3, #privacy-content h4 {
          font-weight: 700;
          color: #fff;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        #privacy-content h1 { font-size: 2rem }
        #privacy-content h2 { font-size: 1.5rem }
        #privacy-content h3 { font-size: 1.25rem }
        #privacy-content p { margin: 0.5rem 0; color: #cbd5e1 }
        #privacy-content strong { font-weight: 700; color: #fff }
        #privacy-content ul { margin-left: 1.25rem }
      `}</style>
    </div>
  );
}
