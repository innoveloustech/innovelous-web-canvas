"use client";
import React, { useState } from "react";
import QuillEditor from "@/components/admin/QuillEditor";
import { useAdminPrivacy } from "@/lib/hooks/admin/useAdminContent";
import { AdminLoading, adminErrorMessage } from "./AdminFeedback";

export default function PrivacyTab() {
  const { data, isLoading, error, savePrivacy, isSaving } = useAdminPrivacy();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (data) {
      setTitle(data.title || "Privacy Policy");
      setContent(data.content || "");
    }
  }, [data]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savePrivacy({ title, content });
      alert("Privacy page saved.");
    } catch (err: unknown) {
      alert(adminErrorMessage(err, "Failed to save privacy page."));
    }
  };

  if (isLoading) return <AdminLoading label="Loading privacy content..." />;
  if (error) return <AdminLoading label={adminErrorMessage(error, "Unable to load privacy content")} />;

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
          <button type="submit" disabled={isSaving} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-800 text-white text-xs uppercase tracking-wider font-semibold rounded-xl">
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
