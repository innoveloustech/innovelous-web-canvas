"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Navbar from "@/components/navbar";
import Cursor from "@/components/MouseFollower";
import CanvasBackground from "@/components/canvas-background";
import ContactSection from "@/components/ContactSection";
import WhatsAppButton from "@/components/whatsapp-button";
import { useLenis } from "@/lib/lenis-provider";
import type { MainCategory, SubCategory } from "@/lib/types/categories";

interface Project {
  id: number;
  title: string;
  category?: string;
  main_category_id: number | null;
  sub_category_id: number | null;
  main_categories?: MainCategory | null;
  sub_categories?: SubCategory | null;
  description: string;
  link: string;
  image_url: string;
  color: string;
  is_featured: boolean;
  sort_order: number;
}

export default function ProjectsClient({ initialProjects, initialMainCategories }: { initialProjects: Project[]; initialMainCategories: MainCategory[] }) {
  const projects = useMemo(() => initialProjects ?? [], [initialProjects]);
  const mainCategories = useMemo(() => initialMainCategories ?? [], [initialMainCategories]);
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const lenis = useLenis();

  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const modalImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (selectedProject) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }

    return () => {
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [selectedProject, lenis]);

  useGSAP(() => {
    if (projects.length > 0) {
      gsap.from(".project-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    }
  }, { scope: containerRef, dependencies: [projects] });

  useGSAP(() => {
    if (selectedProject && modalRef.current && modalContentRef.current) {
      gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.fromTo(modalContentRef.current, { scale: 0.9, opacity: 0, y: 20 }, { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" });
    }
  }, { dependencies: [selectedProject] });

  const closeModal = () => {
    if (modalRef.current && modalContentRef.current) {
      const tl = gsap.timeline({ onComplete: () => setSelectedProject(null) });
      tl.to(modalContentRef.current, { scale: 0.9, opacity: 0, y: 20, duration: 0.2, ease: "power2.in" })
        .to(modalRef.current, { opacity: 0, duration: 0.2 }, "-=0.1");
    } else {
      setSelectedProject(null);
    }
  };

  const handleCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const projectColor = e.currentTarget.getAttribute("data-color") || "rgba(168, 85, 247, 0.5)";
    const arrow = e.currentTarget.querySelector(".card-arrow");
    gsap.killTweensOf(e.currentTarget);
    gsap.killTweensOf(arrow);
    gsap.to(e.currentTarget, { y: -5, borderColor: projectColor, duration: 0.3, ease: "power2.out" });
    gsap.to(arrow, { x: 5, duration: 0.3, ease: "power2.out" });
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const arrow = e.currentTarget.querySelector(".card-arrow");
    gsap.killTweensOf(e.currentTarget);
    gsap.killTweensOf(arrow);
    gsap.to(e.currentTarget, { y: 0, borderColor: "rgba(255, 255, 255, 0.1)", duration: 0.3, ease: "power2.out" });
    gsap.to(arrow, { x: 0, duration: 0.3, ease: "power2.out" });
  };

  const handleModalImageEnter = () => {
    if (modalImageRef.current) {
      gsap.killTweensOf(modalImageRef.current);
      gsap.to(modalImageRef.current, { scale: 1.04, duration: 0.4, ease: "power2.out" });
    }
  };

  const handleModalImageLeave = () => {
    if (modalImageRef.current) {
      gsap.killTweensOf(modalImageRef.current);
      gsap.to(modalImageRef.current, { scale: 1, duration: 0.4, ease: "power2.out" });
    }
  };

  const filteredProjects = useMemo((): Project[] => {
    if (!selectedMainCategoryId) return projects;
    return projects.filter((p: Project) => p.main_category_id === selectedMainCategoryId);
  }, [projects, selectedMainCategoryId]);

  return (
    <>
      <WhatsAppButton phoneNumber="+92 334 9251936" />
      <Cursor />
      <CanvasBackground />
      <Navbar />

      <main ref={containerRef} className="relative min-h-screen bg-[#0a0a0a] text-white pt-32 pb-20 px-6 md:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto mb-20">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
            Selected <br />
            <span className="text-neutral-500">Works.</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl font-light leading-relaxed">
            A curated collection of high-performance digital products, engineered for scale and designed for impact.
          </p>
        </div>

        {/* Category Filter */}
        {mainCategories.length > 0 && (
          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Filter by Category:</label>
              <select
                value={selectedMainCategoryId || ""}
                onChange={(e) => setSelectedMainCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                className="px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition-colors backdrop-blur-sm"
              >
                <option value="">All Projects</option>
                {mainCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {selectedMainCategoryId && (
                <button
                  onClick={() => setSelectedMainCategoryId(null)}
                  className="text-xs text-neutral-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear filter
                </button>
              )}
              <span className="text-xs font-mono text-neutral-600">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>
          </div>
        )}

        {filteredProjects.length === 0 ? (
          <div className="max-w-7xl mx-auto flex items-center justify-center py-20 border border-dashed border-white/5 rounded-3xl">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">
              {selectedMainCategoryId ? 'No projects found in this category.' : 'No Projects Available To Show.'}
            </p>
          </div>
        ) : (
          <div className="projects-grid max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                data-cursor-pointer
                data-color={project.color}
                onClick={() => setSelectedProject(project)}
                onMouseEnter={handleCardEnter}
                onMouseLeave={handleCardLeave}
                className="project-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm cursor-pointer transition-colors duration-300 hover:bg-white/[0.04] min-h-[500px]"
              >
                <div className="relative h-64 overflow-hidden border-b border-white/10 bg-neutral-900">
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-neutral-600 font-mono text-[10px] uppercase tracking-[0.25em]"
                      style={{ background: project.color || '#1f1f23' }}
                    >
                      No Asset
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-5 right-5 w-10 h-10 rounded-full border border-white/10 bg-black/20 backdrop-blur-sm flex items-center justify-center group-hover:border-purple-500/50 transition-colors duration-300">
                    <svg className="card-arrow w-4 h-4 text-neutral-200 group-hover:text-purple-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </div>
                </div>

                <div className="flex flex-col justify-between flex-1 p-8">
                  <div>
                    <span className="text-[10px] font-mono tracking-[0.25em] uppercase px-3 py-1 border rounded-full mb-6 inline-block" style={{ color: project.main_categories?.color || project.color, borderColor: project.main_categories?.color || project.color }}>
                      {project.main_categories?.name || project.category || 'Uncategorized'} → {project.sub_categories?.name || '—'}
                    </span>
                    <h3 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-4 group-hover:text-purple-400 transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="text-neutral-400 text-sm leading-relaxed font-light line-clamp-3">
                      {project.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ContactSection showCapabilities={false} />

      {selectedProject && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
          onClick={closeModal}
        >
          <div
            ref={modalContentRef}
            className="relative w-full max-w-5xl bg-[#0f0f11] border border-white/10 rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              data-cursor="-exclusion"
              className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 overflow-y-auto overscroll-contain">
              <div
                className="relative h-64 lg:h-auto lg:sticky lg:top-0 min-h-[300px] lg:min-h-[500px] bg-neutral-900 overflow-hidden cursor-pointer group"
                onMouseEnter={handleModalImageEnter}
                onMouseLeave={handleModalImageLeave}
              >
                {selectedProject.image_url ? (
                  <img
                    ref={modalImageRef}
                    src={selectedProject.image_url}
                    alt={selectedProject.title}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-600 font-mono text-xs uppercase tracking-widest">
                    No Asset Loaded
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
                <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
                  <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/50 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/5">
                    VISUAL IMAGE
                  </span>
                </div>
              </div>

              <div className="p-8 md:p-12 flex flex-col justify-center bg-[#0f0f11]">
                <span
                  className="text-[10px] font-mono tracking-[0.25em] uppercase mb-4 block"
                  style={{ color: selectedProject.main_categories?.color || selectedProject.color }}
                >
                  {selectedProject.main_categories?.name || selectedProject.category || 'Uncategorized'} → {selectedProject.sub_categories?.name || '—'}
                </span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-6">
                  {selectedProject.title}
                </h2>
                <p className="text-neutral-400 text-base leading-relaxed font-light mb-12 break-words whitespace-pre-wrap">
                  {selectedProject.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  {selectedProject.link && (
                    <a
                      href={selectedProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="-exclusion"
                      className="group relative flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold text-sm overflow-hidden transition-transform hover:scale-105"
                    >
                      <span className="absolute inset-0 w-0 bg-purple-600 group-hover:w-full transition-all duration-500 ease-out" />
                      <span className="relative z-10 group-hover:text-white transition-colors">View Live Project</span>
                      <svg className="relative z-10 w-4 h-4 text-black group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  <button
                    onClick={closeModal}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors duration-300"
                    data-cursor="-exclusion"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
