"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Project {
  id: number;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  image_url?: string;
  link?: string;
  color?: string;
}

export default function FeaturedProjectsClient({ projects }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useGSAP(() => {
    if (isMobile || !pinRef.current || !trackRef.current || projects.length === 0) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      
      const panelVW = window.innerWidth * 0.5;
      const endX = -projects.length * panelVW;
      const scrollDistance = Math.abs(endX);

      // Create a single master timeline to coordinate track scroll and card rise animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: `+=${scrollDistance}`,
          scrub: 1.2,
          pin: true,
          pinSpacing: true,
          pinType: "transform",
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // 1. Move the horizontal scroll track linearly
      tl.to(track, {
        x: endX,
        ease: "none",
        duration: projects.length,
      }, 0);

      // 2. Next cards rise up from bottom as they enter view (synchronized in the master timeline)
      // k=0 is Title Panel (starts fully visible)
      // k=1 is Card 0 (starts fully visible on the right half)
      // k>=2 are subsequent panels that enter the screen from the right
      const panels = track.querySelectorAll<HTMLElement>(".fp-card");
      panels.forEach((panel, k) => {
        if (k < 2) return;

        // Card k enters during timeline interval [k - 2, k - 1]
        // It rises to the top quickly (over 0.7s) to ensure it reaches full height soon after entering
        tl.fromTo(
          panel,
          { y: 200 },
          {
            y: 0,
            ease: "power2.out",
            duration: 0.7,
          },
          k - 2
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile, projects]);

  useGSAP(() => {
    if (!isMobile || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".fp-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [isMobile, projects]);

  if (projects.length === 0) return null;

  // ─── MOBILE ───────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <section
        ref={sectionRef}
        className="relative w-full bg-zinc-950 py-20 text-white overflow-hidden"
      >
        <div className="px-6 mb-12">
          <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase block mb-3">
            Selected Work
          </span>
          <h2 className="text-3xl font-light tracking-tight leading-tight text-white max-w-xs">
            Featured projects &amp; explorations
          </h2>
        </div>

        <div className="flex flex-col gap-10 px-6">
          {projects.map((project, i) => (
            <MobileCard key={project.id} project={project} index={i} />
          ))}

          {/* End card */}
          <div className="fp-card rounded-2xl bg-neutral-900/30 border border-neutral-800 p-10 flex flex-col justify-center items-center text-center space-y-5 min-h-[260px]">
            <p className="text-xl font-light text-neutral-300 leading-snug max-w-[220px]">
              Discover our complete collection of digital experiences, brands, and platforms.
            </p>
            <a
              href="/projects"
              className="text-xs font-mono tracking-widest uppercase underline underline-offset-4 text-neutral-400 hover:text-white transition-colors"
            >
              VIEW ALL PROJECTS →
            </a>
          </div>
        </div>
      </section>
    );
  }

  // ─── DESKTOP ──────────────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-zinc-950 text-white"
    >
      {/* Pinned full-screen container */}
      <div ref={pinRef} className="relative w-full h-screen overflow-hidden">

        {/* FULL-WIDTH horizontally scrolling track */}
        <div className="absolute top-0 left-0 h-full overflow-hidden"
          style={{ width: `${(projects.length + 2) * 50}vw` }}
        >
          <div
            ref={trackRef}
            className="flex h-full will-change-transform"
            style={{ width: `${(projects.length + 2) * 50}vw` }}
          >
            {/* Panel 0: Title panel — w-50vw, full height */}
            <div className="fp-card flex-shrink-0 w-[50vw] h-full flex flex-col justify-between px-14 xl:px-20 py-24 bg-zinc-950 border-r border-neutral-900/30">
              <div>
                <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase block mb-5">
                  Selected Work
                </span>
                <h2 className="text-5xl xl:text-6xl 2xl:text-7xl font-light tracking-tight leading-[1.05] text-white max-w-md">
                  Featured projects &amp; explorations
                </h2>
              </div>
              <a
                href="/projects"
                className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-neutral-400 hover:text-white transition-colors duration-300 group w-fit border-b border-neutral-800 pb-1 hover:border-white"
              >
                VIEW ALL PROJECTS
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
            </div>

            {/* Project cards — each 50vw, full height */}
            {projects.map((project, i) => (
              <div
                key={project.id}
                className="fp-card flex-shrink-0 w-[50vw] h-full flex flex-col justify-between py-24 px-8 bg-zinc-950"
              >
                <DesktopCard project={project} index={i} />
              </div>
            ))}

            {/* End discovery panel — w-50vw, full height */}
            <div className="fp-card flex-shrink-0 w-[50vw] h-full flex flex-col justify-center items-start px-14 xl:px-20 bg-zinc-950 border-l border-neutral-900/30">
              <div className="w-10 h-px bg-neutral-800 mb-8" />
              <p className="text-3xl xl:text-4xl font-light text-neutral-300 leading-snug max-w-sm mb-8">
                Discover our complete collection of digital experiences, brands, and platforms.
              </p>
              <a
                href="/projects"
                className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-neutral-400 hover:text-white transition-colors duration-300 group border-b border-neutral-800 pb-1 hover:border-white"
              >
                VIEW ALL PROJECTS
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── DESKTOP CARD ────────────────────────────────────────────────────────────
function DesktopCard({ project, index }: { project: Project; index: number }) {
  const imgRef = useRef<HTMLImageElement | HTMLDivElement>(null);

  const handleEnter = () => {
    if (!imgRef.current) return;
    gsap.to(imgRef.current, { scale: 1.04, duration: 0.6, ease: "power2.out" });
  };

  const handleLeave = () => {
    if (!imgRef.current) return;
    gsap.to(imgRef.current, { scale: 1, duration: 0.6, ease: "power2.out" });
  };

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="relative w-full h-full flex flex-col justify-between cursor-pointer"
    >
      {/* Image block — takes up remaining space to be full height */}
      <div
        className="relative w-full flex-1 rounded-2xl overflow-hidden bg-neutral-900 mb-6"
      >
        {project.image_url ? (
          // @ts-ignore — ref works fine on img
          <img
            ref={imgRef as React.RefObject<HTMLImageElement>}
            src={project.image_url}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            ref={imgRef as React.RefObject<HTMLDivElement>}
            className="w-full h-full"
            style={{ background: project.color || "#1e1b4b" }}
          />
        )}
        {/* Subtle bottom shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        {/* Index badge */}
        <span className="absolute top-5 right-5 text-[10px] font-mono text-white/70 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Meta below image */}
      <div className="flex items-start justify-between gap-4 pr-2">
        <div className="space-y-1.5">
          <h3 className="text-xl xl:text-2xl font-light tracking-tight text-white leading-tight">
            {project.name}
          </h3>
          <p className="text-sm text-neutral-400 font-light leading-relaxed max-w-[300px]">
            {project.description}
          </p>
        </div>

        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 mt-1 text-[11px] font-mono tracking-widest uppercase text-neutral-400 hover:text-white transition-colors duration-300 border-b border-neutral-800 pb-0.5 hover:border-white whitespace-nowrap"
          >
            EXPLORE PROJECT →
          </a>
        )}
      </div>
    </div>
  );
}

// ─── MOBILE CARD ─────────────────────────────────────────────────────────────
function MobileCard({ project, index }: { project: Project; index: number }) {
  return (
    <div className="fp-card flex flex-col gap-4">
      <div
        className="relative w-full rounded-2xl overflow-hidden bg-neutral-900"
        style={{ height: "56vw" }}
      >
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" style={{ background: project.color || "#1e1b4b" }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        <span className="absolute top-4 right-4 text-[10px] font-mono text-white/70 bg-black/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="flex items-start justify-between gap-3 px-1">
        <div>
          <h3 className="text-lg font-light tracking-tight text-white">{project.name}</h3>
          <p className="text-sm text-neutral-400 font-light leading-relaxed mt-1">{project.description}</p>
        </div>
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 mt-1 text-[10px] font-mono tracking-widest uppercase text-neutral-400 hover:text-white transition-colors underline underline-offset-4"
          >
            EXPLORE →
          </a>
        )}
      </div>
    </div>
  );
}
