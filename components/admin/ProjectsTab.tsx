"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  link: string;
  image_url: string;
  color: string;
  is_featured: boolean;
  sort_order: number;
}

function SortableProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group border border-white/10 bg-white/[0.01] rounded-2xl p-6 flex flex-col justify-between hover:bg-white/[0.03] transition-colors min-h-[260px]">
      <div>
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex items-center gap-2">
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-neutral-500 hover:text-white transition-colors" title="Drag to reorder">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" />
              </svg>
            </button>
            <span className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 border rounded-full" style={{ color: project.color, borderColor: project.color }}>
              {project.category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {project.is_featured && (
              <span className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 border rounded-full border-yellow-500/50 text-yellow-400">Featured</span>
            )}
            {project.image_url && (
              <div className="w-12 h-12 rounded-lg border border-white/10 overflow-hidden bg-black flex-shrink-0">
                <img src={project.image_url} alt="asset node preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
        <h3 className="text-xl font-medium tracking-tight mb-2 group-hover:text-purple-400 transition-colors">{project.title}</h3>
        <p className="text-neutral-500 text-xs leading-relaxed line-clamp-3 font-light">{project.description}</p>
        <div className="mt-3 flex items-center gap-3 text-[10px] font-mono text-neutral-600">
          <span>Order: {project.sort_order}</span>
        </div>
      </div>
      <div className="flex gap-2 border-t border-white/5 pt-4 mt-6">
        <button onClick={() => onEdit(project)} className="flex-1 py-2 text-center text-xs border border-white/10 rounded-lg text-neutral-300 hover:bg-white/5 transition-colors">Modify</button>
        <button onClick={() => onDelete(project)} className="px-3 py-2 text-center text-xs border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">Delete</button>
      </div>
    </div>
  );
}

export default function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [modalMode, setModalMode] = useState<"CREATE" | "UPDATE" | "DELETE" | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [color, setColor] = useState("#a855f7");
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFeatured, setShowFeatured] = useState(true);
  const [togglingFeatured, setTogglingFeatured] = useState(false);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);

  const modalWrapperRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const syncWorkspaceData = async () => {
    const { data, error } = await supabase
      .from("projects_new")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setProjects(data);
    if (error) console.error("Database Sync error:", error.message);
  };

  useEffect(() => {
    syncWorkspaceData();
    supabase.from("site_settings").select("show_featured").eq("id", 1).single().then(({ data }) => {
      if (data) setShowFeatured(data.show_featured);
    });
  }, []);

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
    setIsFeatured(false);
    setSortOrder(0);
    setMediaFile(null);
  };

  const confirmToggleFeatured = async () => {
    setTogglingFeatured(true);
    setShowFeaturedModal(false);
    const newVal = !showFeatured;
    const { error } = await supabase.from("site_settings").update({ show_featured: newVal }).eq("id", 1);
    if (!error) setShowFeatured(newVal);
    else alert("Failed to toggle featured section.");
    setTogglingFeatured(false);
  };

  const openFormModal = (mode: "CREATE" | "UPDATE" | "DELETE", project?: Project) => {
    if (project) {
      setActiveProject(project);
      setTitle(project.title);
      setCategory(project.category);
      setDescription(project.description);
      setLink(project.link);
      setColor(project.color || "#a855f7");
      setIsFeatured(project.is_featured);
      setSortOrder(project.sort_order);
    } else {
      clearFormFields();
    }
    setModalMode(mode);
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
        const { error: insErr } = await supabase.from("projects_new").insert([
          { title, category, description, link, color, image_url: resolvedImageUrl, is_featured: isFeatured, sort_order: sortOrder }
        ]);
        if (insErr) throw insErr;
      } else if (modalMode === "UPDATE" && activeProject) {
        const { error: updErr } = await supabase
          .from("projects_new")
          .update({ title, category, description, link, color, image_url: resolvedImageUrl, is_featured: isFeatured, sort_order: sortOrder })
          .eq("id", activeProject.id);
        if (updErr) throw updErr;
      }

      await syncWorkspaceData();
      dismissModalContext();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "An exception error occurred writing to cloud storage registries.");
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
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Drop row event caught exception handling logs.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(projects, oldIndex, newIndex);
    const updated = reordered.map((p, i) => ({ ...p, sort_order: i }));
    setProjects(updated);

    try {
      const updates = updated.map((p) =>
        supabase.from("projects_new").update({ sort_order: p.sort_order }).eq("id", p.id)
      );
      await Promise.all(updates);
    } catch (err: unknown) {
      console.error("Failed to update sort_order:", err instanceof Error ? err.message : err);
      await syncWorkspaceData();
    }
  };

  const filteredProjects = useMemo(() => {
    if (!debouncedSearch.trim()) return projects;
    const q = debouncedSearch.toLowerCase();
    return projects.filter(
      (p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [projects, debouncedSearch]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-8 mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Manage Projects</h1>
          <p className="text-neutral-500 text-xs mt-1 font-light">Drag cards to reorder. Search to filter.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowFeaturedModal(true)} disabled={togglingFeatured} className={`px-5 py-3 text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 font-medium ${showFeatured ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30" : "bg-neutral-800/50 text-neutral-500 border border-white/10 hover:bg-white/5"}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {showFeatured ? "Featured On" : "Featured Off"}
          </button>
          <Link href="/projects" className="px-5 py-3 border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Projects
          </Link>
          <button onClick={() => openFormModal("CREATE")} className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs uppercase tracking-wider rounded-xl transition-colors">
            Create Object
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search projects by title, category, or description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 pl-12 bg-black border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-600" />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Project Grid */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredProjects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <SortableProjectCard key={project.id} project={project} onEdit={(p) => openFormModal("UPDATE", p)} onDelete={(p) => openFormModal("DELETE", p)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {filteredProjects.length === 0 && (
        <div className="flex items-center justify-center py-20 border border-dashed border-white/5 rounded-3xl">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">
            {debouncedSearch ? "No projects match your search." : "No Projects Available. Create one to get started."}
          </p>
        </div>
      )}

      {/* Modal */}
      {modalMode && (
        <div ref={modalWrapperRef} className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={dismissModalContext}>
          <div ref={modalBoxRef} className="w-full max-w-xl bg-[#0f0f11] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={dismissModalContext} className="absolute top-6 right-6 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">&times;</button>

            {modalMode === "DELETE" ? (
              <div>
                <h3 className="text-2xl font-light tracking-tight text-white mb-2">Destructive Access Instruction</h3>
                <p className="text-neutral-400 text-sm font-light leading-relaxed mb-6">
                  Are you sure you want to permanently delete <span className="text-white font-medium">{activeProject?.title}</span>? This instruction will drop the values from postgres servers instantly.
                </p>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={dismissModalContext} className="px-4 py-2.5 text-xs uppercase tracking-wider font-medium text-neutral-400 hover:text-white transition-colors">Cancel</button>
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
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Category Classification</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none">
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="AI Integration">AI Integration</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Brand Layout Glow Color</label>
                      <div className="flex gap-2">
                        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 bg-transparent border-0 cursor-pointer p-0" />
                        <input type="text" value={color} onChange={e => setColor(e.target.value)} className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white uppercase font-mono" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Description Context</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white min-h-[90px] resize-none focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Link Target Route URL</label>
                    <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://" className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Sort Order</label>
                      <input type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)} min={0} className="w-full p-3 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Featured on Homepage</label>
                      <div className="flex items-center gap-3 h-full pt-2">
                        <button type="button" onClick={() => setIsFeatured(!isFeatured)} className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isFeatured ? "bg-purple-600" : "bg-neutral-700"}`}>
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${isFeatured ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
                        <span className="text-xs text-neutral-400 font-mono">{isFeatured ? "Enabled" : "Disabled"}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-neutral-500 font-mono mb-1">Thumbnail Media Asset Representation</label>
                    <div className="p-4 border border-dashed border-white/10 rounded-xl text-center relative hover:border-white/20 transition-colors">
                      <input type="file" accept="image/*" onChange={e => setMediaFile(e.target.files ? e.target.files[0] : null)} required={modalMode === "CREATE"} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                      <p className="text-xs text-neutral-400 font-light">
                        {mediaFile ? `Queued: ${mediaFile.name}` : modalMode === "UPDATE" ? "Leave blank to keep current thumbnail asset" : "Click or drop thumbnail image asset package here"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-4 border-t border-white/5 mt-6">
                    <button type="button" onClick={dismissModalContext} className="px-4 py-2.5 text-xs uppercase tracking-wider font-medium text-neutral-400 hover:text-white transition-colors">Cancel</button>
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

      {/* Featured toggle confirmation modal */}
      {showFeaturedModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setShowFeaturedModal(false)}>
          <div className="w-full max-w-md bg-[#0f0f11] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${showFeatured ? "bg-red-600/10 border border-red-600/20" : "bg-emerald-600/10 border border-emerald-600/20"}`}>
                <svg className={`w-5 h-5 ${showFeatured ? "text-red-400" : "text-emerald-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">
                  {showFeatured ? "Disable Featured Projects" : "Enable Featured Projects"}
                </h3>
              </div>
            </div>

            <p className="text-neutral-400 text-sm font-light leading-relaxed mb-6">
              {showFeatured ? (
                <>The <span className="text-white font-medium">Featured Projects</span> section will be <span className="text-red-400">hidden</span> from the homepage. Featured badges on individual projects remain intact.</>
              ) : (
                <>The <span className="text-white font-medium">Featured Projects</span> section will <span className="text-emerald-400">appear</span> on the homepage, displaying projects marked as featured. Rebuild the site to publish this change live.</>
              )}
            </p>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowFeaturedModal(false)} className="px-4 py-2.5 text-xs uppercase tracking-wider font-medium text-neutral-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={confirmToggleFeatured} className={`px-5 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-xl transition-colors ${showFeatured ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
