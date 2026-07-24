"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import AdminSidebar, { type TabId } from "@/components/admin/AdminSidebar";
import DashboardTab from "@/components/admin/DashboardTab";
import ProjectsTab from "@/components/admin/ProjectsTab";
import SiteSettingsTab from "@/components/admin/SiteSettingsTab";
import TestimonialsTab from "@/components/admin/TestimonialsTab";
import FaqsTab from "@/components/admin/FaqsTab";

export default function AdminPortal() {
  const [session, setSession] = useState<Session | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const executeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) alert(`Access Denied: ${error.message}`);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white px-4 font-sans">
        <div className="w-full max-w-md border border-white/10 bg-white/[0.02] backdrop-blur-md p-8 rounded-3xl">
          <h2 className="text-3xl font-light tracking-tight mb-1">Terminal</h2>
          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-6">Internal Access Authorization</p>
          <form onSubmit={executeLogin} className="space-y-4">
            <input type="email" placeholder="Identifier Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required
              className="w-full p-4 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors" />
            <input type="password" placeholder="Key Verification Token" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required
              className="w-full p-4 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors" />
            <button type="submit" className="w-full p-4 bg-white text-black text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-neutral-200 transition-colors">
              Connect Workspace
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 pt-16 md:pt-0 overflow-y-auto">
        <div className="p-6 md:p-10">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "projects" && <ProjectsTab />}
          {activeTab === "settings" && <SiteSettingsTab />}
          {activeTab === "testimonials" && <TestimonialsTab />}
          {activeTab === "faq" && <FaqsTab />}
        </div>
      </main>
    </div>
  );
}
