"use client";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import TransitionLink from "@/components/TransitionLink";
import {
  OurServicesBackdrop,
  OurServicesMobileSection,
  useFramePreloader,
  addServicesToTimeline,
} from "@/components/home/OurServicesScrollSection";

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
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Our Services backdrop refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);
  const cardTopRef = useRef<HTMLDivElement>(null);
  const cardLeftRef = useRef<HTMLDivElement>(null);
  const cardRightRef = useRef<HTMLDivElement>(null);
  const frameCounterRef = useRef<HTMLSpanElement>(null);

  const [scale, setScale] = useState(1);
  const [activeMobileCard, setActiveMobileCard] = useState(0);

  const { renderFrame } = useFramePreloader(canvasRef);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mobile = w < 768;
      setIsMobile(mobile);
      if (!mobile) {
        const scaleW = (w - 60) / 1200;
        const scaleH = (h - 100) / 720;
        setScale(Math.min(1, Math.max(0.75, Math.min(scaleW, scaleH))));
      } else {
        setScale(1);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useGSAP(
    () => {
      if (!sectionRef.current || projects.length === 0) return;

      const mm = gsap.matchMedia();

      // DESKTOP: Only pin and animate horizontal track on screens >= 768px
      mm.add("(min-width: 768px)", () => {
        if (!pinRef.current || !trackRef.current) return;
        const track = trackRef.current;
        const panelVW = window.innerWidth * 0.5;
        const totalPanels = projects.length + 2;
        const endX = -totalPanels * panelVW;
        const scrollDistance = Math.abs(endX);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinRef.current,
            start: "top top",
            end: `+=${scrollDistance + 3800}`,
            scrub: 1.2,
            pin: true,
            pinSpacing: true,
            pinType: "transform",
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // 1. Move the horizontal scroll track completely off-screen to reveal the background
        tl.to(
          track,
          {
            x: endX,
            ease: "none",
            duration: totalPanels,
          },
          0
        );

        // 2. Track horizontal scroll progress bar
        const cardsDuration = Math.max(1, projects.length);
        tl.to(
          ".fp-progress-indicator",
          {
            width: "100%",
            ease: "none",
            duration: cardsDuration,
          },
          0
        );

        // 3. Exclude background section from scroll progress bar
        tl.to(
          ".fp-progress-container",
          {
            opacity: 0,
            ease: "power2.out",
            duration: 0.5,
          },
          cardsDuration + 0.2
        );

        // 4. Counter-parallax for project card images
        const imageInners = track.querySelectorAll<HTMLElement>(".fp-image-inner");
        imageInners.forEach((img, idx) => {
          tl.fromTo(
            img,
            { xPercent: 10 },
            { xPercent: -10, ease: "none", duration: 1.2 },
            Math.max(0, idx)
          );
        });

        // 5. Next cards rise up from bottom as they enter view
        const panels = track.querySelectorAll<HTMLElement>(".fp-card");
        panels.forEach((panel, k) => {
          if (k < 2) return;
          tl.fromTo(
            panel,
            { y: 160 },
            {
              y: 0,
              ease: "power2.out",
              duration: 0.7,
            },
            k - 2
          );
        });

        // 6. Our Services narrative unfolds behind the sliding cards
        addServicesToTimeline({
          timeline: tl,
          startTime: totalPanels - 0.4,
          duration: 5.5,
          isMobile: false,
          canvasContainer: canvasContainerRef.current,
          ambientGlow: ambientGlowRef.current,
          cardTop: cardTopRef.current,
          cardLeft: cardLeftRef.current,
          cardRight: cardRightRef.current,
          frameCounter: frameCounterRef.current,
          renderFrame,
        });
      });

      // MOBILE: Standard scroll fade-in, ZERO pinning, ZERO extra scroll space
      mm.add("(max-width: 767px)", () => {
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
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [isMobile, projects, renderFrame] }
  );

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
          <div className="fp-card rounded-2xl bg-zinc-900 border border-neutral-800 p-10 flex flex-col justify-center items-center text-center space-y-5 min-h-[260px]">
            <p className="text-xl font-light text-neutral-300 leading-snug max-w-[220px]">
              Discover our complete collection of digital experiences, brands, and platforms.
            </p>
            <TransitionLink
              href="/projects"
              className="text-xs font-mono tracking-widest uppercase underline underline-offset-4 text-neutral-400 hover:text-white transition-colors"
            >
              VIEW ALL PROJECTS →
            </TransitionLink>
          </div>
        </div>

        {/* Mobile Our Services narrative */}
        <OurServicesMobileSection
          canvasRef={canvasRef}
          activeMobileCard={activeMobileCard}
          setActiveMobileCard={setActiveMobileCard}
        />
      </section>
    );
  }

  // ─── DESKTOP ──────────────────────────────────────────────────────────────
  const totalPanels = projects.length + 2;

  return (
    <section
      ref={sectionRef}
      className="relative w-full text-white bg-transparent"
    >
      {/* Pinned full-screen container */}
      <div ref={pinRef} className="relative w-full h-screen overflow-x-clip bg-transparent">
        {/* 1. OUR SERVICES BACKDROP (Revealed when horizontal track slides away) */}
        <OurServicesBackdrop
          canvasRef={canvasRef}
          canvasContainerRef={canvasContainerRef}
          ambientGlowRef={ambientGlowRef}
          cardTopRef={cardTopRef}
          cardLeftRef={cardLeftRef}
          cardRightRef={cardRightRef}
          frameCounterRef={frameCounterRef}
          scale={scale}
        />

        {/* Horizontal scroll progress line indicator */}
        <div className="fp-progress-container absolute bottom-8 left-14 right-14 z-20 pointer-events-none hidden md:flex items-center gap-4">
          <span className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">
            01
          </span>
          <div className="flex-1 h-[2px] bg-neutral-900/80 rounded-full overflow-hidden">
            <div className="fp-progress-indicator h-full w-0 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full" />
          </div>
          <span className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">
            {String(projects.length).padStart(2, "0")}
          </span>
        </div>

        {/* 2. FULL-WIDTH horizontally scrolling track - Solid seamless 50vw panels */}
        <div
          className="absolute top-0 left-0 h-full z-10 pointer-events-none"
          style={{ width: `${totalPanels * 50}vw` }}
        >
          <div
            ref={trackRef}
            className="flex h-full will-change-transform pointer-events-auto bg-zinc-950"
            style={{ width: `${totalPanels * 50}vw` }}
          >
            {/* Panel 0: Title panel — w-50vw, full height, zinc-950 */}
            <div className="fp-card flex-shrink-0 w-[50vw] h-full flex flex-col justify-between px-14 xl:px-20 py-24 bg-zinc-950 border-r border-neutral-900/60">
              <div>
                <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase block mb-5">
                  Selected Work
                </span>
                <h2 className="text-5xl xl:text-6xl 2xl:text-7xl font-light tracking-tight leading-[1.05] text-white max-w-md">
                  Featured projects &amp; explorations
                </h2>
              </div>
              <TransitionLink
                href="/projects"
                className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-neutral-400 hover:text-white transition-colors duration-300 group w-fit border-b border-neutral-800 pb-1 hover:border-white"
              >
                VIEW ALL PROJECTS
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </TransitionLink>
            </div>

            {/* Project cards — each 50vw, full height, solid zinc-950 with border divider */}
            {projects.map((project, i) => (
              <div
                key={project.id}
                className="fp-card flex-shrink-0 w-[50vw] h-full flex flex-col justify-between py-24 px-8 bg-zinc-950 border-r border-neutral-900/60"
              >
                <DesktopCard project={project} index={i} />
              </div>
            ))}

            {/* End discovery panel — w-50vw, full height, solid zinc-950 */}
            <div className="fp-card flex-shrink-0 w-[50vw] h-full flex flex-col justify-center items-start px-14 xl:px-20 bg-zinc-950 border-l border-neutral-900/60">
              <div className="w-10 h-px bg-neutral-800 mb-8" />
              <p className="text-3xl xl:text-4xl font-light text-neutral-300 leading-snug max-w-sm mb-8">
                Discover our complete collection of digital experiences, brands, and platforms.
              </p>
              <TransitionLink
                href="/projects"
                className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-neutral-400 hover:text-white transition-colors duration-300 group border-b border-neutral-800 pb-1 hover:border-white"
              >
                VIEW ALL PROJECTS
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </TransitionLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── DESKTOP CARD ────────────────────────────────────────────────────────────
function DesktopCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | HTMLDivElement>(null);

  const handleEnter = () => {
    if (!imgRef.current) return;
    gsap.to(imgRef.current, { scale: 1.08, duration: 0.6, ease: "power2.out" });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(cardRef.current, {
      rotateY: x * 6,
      rotateX: -y * 6,
      transformPerspective: 1000,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, { rotateY: 0, rotateX: 0, duration: 0.5, ease: "power3.out" });
    }
    if (!imgRef.current) return;
    gsap.to(imgRef.current, { scale: 1.04, duration: 0.6, ease: "power2.out" });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      className="relative w-full h-full flex flex-col justify-between cursor-pointer"
    >
      {/* Image block — takes up remaining space to be full height */}
      <div
        className="relative w-full flex-1 rounded-2xl overflow-hidden bg-neutral-900 mb-6 shadow-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
      >
        {project.image_url ? (
          <img
            ref={imgRef as React.RefObject<HTMLImageElement>}
            src={project.image_url}
            alt={project.name}
            className="fp-image-inner w-full h-full object-cover will-change-transform scale-105"
          />
        ) : (
          <div
            ref={imgRef as React.RefObject<HTMLDivElement>}
            className="fp-image-inner w-full h-full will-change-transform scale-105"
            style={{ background: project.color || "#1e1b4b" }}
          />
        )}
        {/* Subtle bottom shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        {/* Index badge */}
        <span className="absolute top-5 right-5 text-[10px] font-mono text-white/70 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/5">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Meta below image */}
      <div className="flex items-start justify-between gap-4 pr-2">
        <div className="space-y-1.5">
          <h3 className="text-xl xl:text-2xl font-light tracking-tight text-white leading-tight transition-colors duration-300 hover:text-purple-400">
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