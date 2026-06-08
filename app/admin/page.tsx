"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  link: string;
  image_url: string;
  color: string;
}

export default function AdminDashboardPortal() {
  const [session, setSession] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [modalMode, setModalMode] = useState<"CREATE" | "UPDATE" | "DELETE" | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [color, setColor] = useState("#a855f7");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const modalWrapperRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const syncWorkspaceData = async () => {
    const { data, error } = await supabase.from("projects_new").select("*").order("created_at", { ascending: false });
    if (data) setProjects(data);
    if (error) console.error("Database Sync error:", error.message);
  };

  useEffect(() => {
    if (session) syncWorkspaceData();
  }, [session]);

  useGSAP(() => {
    if (modalMode && modalWrapperRef.current && modalBoxRef.current) {
      gsap.fromTo(modalWrapperRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
      gsap.fromTo(modalBoxRef.current, { scale: 0.95, y: 15 }, { scale: 1, y: 0, duration: 0.3, ease: "back.out(1.1)" });
    }
  }, { dependencies: [modalMode] });

  const dismissModalContext = () => {
    if (modalWrapperRef.current && modalBoxRef.current) {
      const tl = gsap.timeline({ onComplete: () => { setModalMode(null); setActiveProject(null); clearFormFields(); } });
      tl.to(modalBoxRef.current, { scale: 0.95, y: 10, opacity: 0, duration: 0.2, ease: "power2.in" })
        .to(modalWrapperRef.current, { opacity: 0, duration: 0.15 }, "-=0.1");
    } else {
      setModalMode(null);
    }
  };

  const clearFormFields = () => {
    setTitle(""); 
    setCategory("Web Development"); 
    setDescription(""); 
    setLink(""); 
    setColor("#a855f7"); 
    setMediaFile(null);
  };

  const openFormModal = (mode: "CREATE" | "UPDATE" | "DELETE", project?: Project) => {
    if (project) {
      setActiveProject(project); 
      setTitle(project.title); 
      setCategory(project.category); 
      setDescription(project.description); 
      setLink(project.link); 
      setColor(project.color || "#a855f7");
    } else {
      clearFormFields();
    }
    setModalMode(mode);
  };

  const executeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) alert(`Access Denied: ${error.message}`);
  };

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      let resolvedImageUrl = activeProject?.image_url || "";
      if (mediaFile) {
        const ext = mediaFile.name.split(".").pop();
        const prodName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const finalPath = `portfolio-assets/${prodName}`;
        const { error: uploadError } = await supabase.storage.from("projects_new-images").upload(finalPath, mediaFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("projects_new-images").getPublicUrl(finalPath);
        resolvedImageUrl = publicUrl;
      }

      if (modalMode === "CREATE") {
        if (!mediaFile) throw new Error("An image asset file is required for initial project creations.");
        const { error: insErr } = await supabase.from("projects_new").insert([{ title, category, description, link, color, image_url: resolvedImageUrl }]);
        if (insErr) throw insErr;
      } else if (modalMode === "UPDATE" && activeProject) {
        const { error: updErr } = await supabase.from("projects_new").update({ title, category, description, link, color, image_url: resolvedImageUrl }).eq("id", activeProject.id);
        if (updErr) throw updErr;
      }

      await syncWorkspaceData();
      dismissModalContext();
    } catch (err: any) {
      alert(err.message || "An exception error occurred writing to cloud storage registries.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeletionCall = async () => {
    if (!activeProject) return;
    setProcessing(true);
    try {
      const { error: delErr } = await supabase.from("projects_new").delete().eq("id", activeProject.id);
      if (delErr) throw delErr;
      await syncWorkspaceData();
      dismissModalContext();
    } catch (err: any) {
      alert(err.message || "Drop row event caught exception handling logs.");
    } finally {
      setProcessing(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white px-4 font-sans">
        <div className="w-full max-w-md border border-white/10 bg-white/[0.02] backdrop-blur-md p-8 rounded-3xl">
          <h2 className="text-3xl font-light tracking-tight mb-1">Terminal</h2>
          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-6">Internal Access Authorization</p>
          <form onSubmit={executeLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Identifier Email" 
              value={authEmail} 
              onChange={e => setAuthEmail(e.target.value)} 
              required 
              className="w-full p-4 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors" 
            />
            <input 
              type="password" 
              placeholder="Key Verification Token" 
              value={authPassword} 
              onChange={e => setAuthPassword(e.target.value)} 
              required 
              className="w-full p-4 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition-colors" 
            />
            <button type="submit" className="w-full p-4 bg-white text-black text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-neutral-200 transition-colors">
              Connect Workspace
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-6 md:px-16 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-8 mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Dashboard To Manage Projects</h1>
          <p className="text-neutral-500 text-xs mt-1 font-light">Manage database rows alongside flat preview visual representation modules.</p>
        </div>
        <div className="flex gap-3">
          {/* NEW: View Projects Button */}
          <Link 
            href={"/projects" as any} 
            className="px-5 py-3 border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Projects
          </Link>
          
          <button 
            onClick={() => openFormModal("CREATE")} 
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs uppercase tracking-wider rounded-xl transition-colors"
          >
            Create Object
          </button>
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="px-5 py-3 border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white text-xs uppercase tracking-wider rounded-xl transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {projects.map((project) => (
          <div key={project.id} className="group border border-white/10 bg-white/[0.01] rounded-2xl p-6 flex flex-col justify-between hover:bg-white/[0.03] transition-colors min-h-[260px]">
            <div>
              <div className="flex justify-between items-start gap-4 mb-4">
                <span className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 border rounded-full" style={{ color: project.color, borderColor: project.color }}>
                  {project.category}
                </span>
                {project.image_url && (
                  <div className="w-12 h-12 rounded-lg border border-white/10 overflow-hidden bg-black flex-shrink-0">
                    <img src={project.image_url} alt="asset node preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-medium tracking-tight mb-2 group-hover:text-purple-400 transition-colors">{project.title}</h3>
              <p className="text-neutral-500 text-xs leading-relaxed line-clamp-3 font-light">{project.description}</p>
            </div>
            <div className="flex gap-2 border-t border-white/5 pt-4 mt-6">
              <button 
                onClick={() => openFormModal("UPDATE", project)} 
                className="flex-1 py-2 text-center text-xs border border-white/10 rounded-lg text-neutral-300 hover:bg-white/5 transition-colors"
              >
                Modify
              </button>
              <button 
                onClick={() => openFormModal("DELETE", project)} 
                className="px-3 py-2 text-center text-xs border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalMode && (
        <div ref={modalWrapperRef} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={dismissModalContext}>
          <div ref={modalBoxRef} className="w-full max-w-xl bg-[#0f0f11] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={dismissModalContext} className="absolute top-6 right-6 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
              &times;
            </button>
            
            {modalMode === "DELETE" ? (
              <div>
                <h3 className="text-2xl font-light tracking-tight text-white mb-2">Destructive Access Instruction</h3>
                <p className="text-neutral-400 text-sm font-light leading-relaxed mb-6">
                  Are you sure you want to permanently delete <span className="text-white font-medium">{activeProject?.title}</span>? This instruction will drop the values from postgres servers instantly.
                </p>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={dismissModalContext} className="px-4 py-2.5 text-xs uppercase tracking-wider font-medium text-neutral-400 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleDeletionCall} disabled={processing} className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:bg-neutral-800 transition-colors">
                    {processing ? "Purging..." : "Confirm Delete"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-light tracking-tight text-white mb-6">
                  {modalMode === "CREATE" ? "Initialize Data Object" : "Modify Structural Values"}
                </h3>
                <form onSubmit={handleFormSubmission} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Project Name</label>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      required 
                      className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Category Classification</label>
                      <select 
                        value={category} 
                        onChange={e => setCategory(e.target.value)} 
                        className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="AI Integration">AI Integration</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Brand Layout Glow Color</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={color} 
                          onChange={e => setColor(e.target.value)} 
                          className="w-10 h-10 bg-transparent border-0 cursor-pointer p-0" 
                        />
                        <input 
                          type="text" 
                          value={color} 
                          onChange={e => setColor(e.target.value)} 
                          className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white uppercase font-mono" 
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Description Context</label>
                    <textarea 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      required 
                      className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white min-h-[90px] resize-none focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Link Target Route URL</label>
                    <input 
                      type="url" 
                      value={link} 
                      onChange={e => setLink(e.target.value)} 
                      placeholder="https://" 
                      className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Thumbnail Media Asset Representation</label>
                    <div className="p-4 border border-dashed border-white/10 rounded-xl text-center relative hover:border-white/20 transition-colors">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => setMediaFile(e.target.files ? e.target.files[0] : null)} 
                        required={modalMode === "CREATE"} 
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                      />
                      <p className="text-xs text-neutral-400 font-light">
                        {mediaFile ? `Queued: ${mediaFile.name}` : modalMode === "UPDATE" ? "Leave blank to keep current thumbnail asset" : "Click or drop thumbnail image asset package here"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-4 border-t border-white/5 mt-6">
                    <button type="button" onClick={dismissModalContext} className="px-4 py-2.5 text-xs uppercase tracking-wider font-medium text-neutral-400 hover:text-white transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={processing} className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:bg-neutral-800 transition-colors">
                      {processing ? "Uploading Assets..." : modalMode === "CREATE" ? "Commit Entry" : "Save Structural Shift"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}