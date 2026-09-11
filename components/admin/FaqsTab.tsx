"use client";
import React, { useState } from "react";
import type { FaqItem } from "@/lib/types/admin";
import { useAdminFaqs } from "@/lib/hooks/admin/useAdminContent";
import { AdminLoading, adminErrorMessage } from "./AdminFeedback";

const EMPTY_FAQS: FaqItem[] = [];

export default function FaqsTab() {
  const { data, isLoading, error, saveFaqs, isSaving } = useAdminFaqs();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [saved, setSaved] = useState(false);
  // Query data hydrates the editable draft; subsequent changes stay local until save.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => setFaqs(data ?? EMPTY_FAQS), [data]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const updateField = (id: number, field: string, value: string) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const handleSave = async () => {
    setSaved(false);
    try {
      await saveFaqs(faqs);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      alert(adminErrorMessage(err, "Failed to save FAQs."));
    }
  };

  if (isLoading) return <AdminLoading label="Loading FAQs..." />;
  if (error) return <AdminLoading label={adminErrorMessage(error, "Unable to load FAQs")} />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">FAQ Editor</h1>
        <p className="text-neutral-500 text-sm font-light">
          Edit the frequently asked questions shown on the homepage bento grid.
        </p>
      </div>

      <div className="space-y-6">
        {faqs.map((f, i) => (
          <div key={f.id} className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-mono text-neutral-600">Q{i + 1}</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1.5">Question</label>
                <textarea
                  value={f.question}
                  onChange={(e) => updateField(f.id, "question", e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1.5">Answer</label>
                <textarea
                  value={f.answer}
                  onChange={(e) => updateField(f.id, "answer", e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-800 text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition-colors flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
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
            FAQs saved
          </span>
        )}
      </div>
    </div>
  );
}
