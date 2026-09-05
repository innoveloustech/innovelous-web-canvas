"use client";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import QuillEditor from "@/components/admin/QuillEditor";

export default function PrivacyTab() {
  const [title, setTitle] = useState<string>("Privacy Policy");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fetchPage = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_pages")
      .select("*")
      .eq("slug", "privacy")
      .maybeSingle();

    if (error) {
      console.error(error);
    } else if (data) {
      setTitle(data.title || "Privacy Policy");
      setContent(data.content || "");
    } else {
      // ensure a row exists for privacy so future single() calls succeed
      await supabase.from("site_pages").upsert({ slug: "privacy", title: "Privacy Policy", content: "" });
    }
    setLoading(false);
  };

  useEffect(() => {
    void fetchPage();
  }, []);

  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = content;
  }, [content]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_pages")
        .upsert({ slug: "privacy", title, content, updated_at: new Date().toISOString() })
        .select();
      if (error) throw error;
      await fetchPage();
      alert("Privacy page saved.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save privacy page.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-10">Loading privacy content...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-4">Privacy Policy</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs text-neutral-400 mb-2 font-mono">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white" />
        </div>

        <div>
          <label className="block text-xs text-neutral-400 mb-2 font-mono">Content</label>
          <QuillEditor value={content} onChange={setContent} />
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-800 text-white text-xs uppercase tracking-wider font-semibold rounded-xl">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
