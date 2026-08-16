"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

export default function DashboardTab() {
  const settings = useSiteSettings();
  const [showConfirm, setShowConfirm] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handlePublish = async () => {
    setPublishing(true);
    setResult(null);
    setShowConfirm(false);

    try {
      const { data, error } = await supabase.functions.invoke("publish-site", {
        method: "POST",
      });

      if (error) {
        setResult({ type: "error", message: error.message });
      } else if (data?.error) {
        setResult({ type: "error", message: data.error });
      } else {
        setResult({ type: "success", message: data?.message ?? "Deployment rebuild initialized." });
      }
    } catch (err) {
      setResult({ type: "error", message: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
          Welcome back, Admin
        </h1>
        <p className="text-neutral-500 text-sm font-light max-w-xl">
          Manage your portfolio projects, update site-wide branding, and publish changes live.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-white text-sm font-medium mb-1">Manage Projects</h3>
          <p className="text-neutral-500 text-xs font-light">Add, edit, reorder, and remove portfolio projects.</p>
        </div>

        <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-white text-sm font-medium mb-1">Site Settings</h3>
          <p className="text-neutral-500 text-xs font-light">Update social links, logo, favicon, and contact info.</p>
        </div>

        <div className="border border-white/10 bg-white/[0.02] rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="text-white text-sm font-medium mb-1">Publish Changes</h3>
          <p className="text-neutral-500 text-xs font-light">Trigger a rebuild to deploy changes live to production.</p>
        </div>
      </div>

      {/* Publish section */}
      <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-white text-base font-medium mb-2">Publish to Production</h3>
            <p className="text-neutral-400 text-sm font-light leading-relaxed mb-4">
              After making changes to projects or site settings, click the button below to rebuild the site.
              This will make all current changes visible on the live site.
              <br />
              <span className="text-amber-400/80 text-xs font-mono mt-2 block">
                Warning: This will trigger a full rebuild and may take 1–5 minutes to complete.
              </span>
            </p>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={publishing}
              className="px-6 py-3 bg-amber-600 text-amber-50 text-xs uppercase tracking-wider font-semibold rounded-xl border border-amber-500 hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {publishing ? "Publishing..." : "Publish Changes"}
            </button>
            {result && (
              <div className={`mt-3 text-xs font-mono ${result.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                {result.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current settings summary */}
      <div className="mt-8 border border-white/10 bg-white/[0.02] rounded-2xl p-6">
        <h3 className="text-white text-sm font-medium mb-4">Current Site Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-neutral-600 font-mono w-24">Email:</span>
            <span className="text-neutral-300">{settings.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-neutral-600 font-mono w-24">Phone:</span>
            <span className="text-neutral-300">{settings.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-neutral-600 font-mono w-24">Location:</span>
            <span className="text-neutral-300">{settings.office_location}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-neutral-600 font-mono w-24">Social:</span>
            <span className="text-neutral-300 truncate">{settings.facebook_url}</span>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-white text-lg font-semibold mb-3">Publish to Production?</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
              This will trigger a full rebuild of the live site. Changes to projects, site settings,
              testimonials, and FAQ will be published. This may take 1–5 minutes.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2.5 text-xs text-neutral-400 font-medium rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className="px-5 py-2.5 text-xs text-white font-semibold rounded-xl bg-amber-600 hover:bg-amber-500 transition-colors"
              >
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
