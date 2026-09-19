"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TransitionLink from "@/components/TransitionLink";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const TOTAL_FRAMES = 120;

export interface ServiceCardData {
  id: string;
  tag: string;
  title: string;
  description: string;
  pills: string[];
  link: string;
  linkText: string;
}

export const serviceCards: ServiceCardData[] = [
  {
    id: "01",
    tag: "[ 01 // ENGINEERING ]",
    title: "Custom Software & Rapid MVP Development",
    description:
      "High-performance web apps, mobile platforms, and scalable cloud architectures engineered to turn vision into market-ready reality.",
    pills: ["Scalable Architecture", "Rapid Deployment"],
    link: "/solutions",
    linkText: "EXPLORE ENGINEERING →",
  },
  {
    id: "02",
    tag: "[ 02 // AI & AUTOMATION ]",
    title: "Applied AI Systems & Intelligent Automation",
    description:
      "Modernize operations and eliminate friction with tailored AI integrations, autonomous business workflows, and predictive systems.",
    pills: ["Smart Workflows", "Custom Integrations"],
    link: "/solutions",
    linkText: "EXPLORE AI SOLUTIONS →",
  },
  {
    id: "03",
    tag: "[ 03 // DESIGN & PRODUCT ]",
    title: "Intuitive UI/UX & Interactive Web Experiences",
    description:
      "Award-winning digital interfaces, design systems, and fluid interactive experiences crafted to captivate users and drive conversion.",
    pills: ["Human-Centered UX", "Design Systems"],
    link: "/solutions",
    linkText: "EXPLORE DESIGN →",
  },
];

// Helper to compute image frame path
export const getFramePath = (index: number) => {
  const frameNum = String(index + 1).padStart(4, "0");
  return `/frames/frame_${frameNum}.webp`;
};

// ─── HOOK: FRAME PRELOADER & RENDERER ──────────────────────────────────────────
export function useFramePreloader(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const activeFrameRef = useRef(0);

  const renderFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let img = imagesRef.current[frameIndex];

      // Fallback search outward if targeted frame is still buffering
      if (!img || !img.complete || img.naturalWidth === 0) {
        for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
          const prev = imagesRef.current[frameIndex - offset];
          if (prev && prev.complete && prev.naturalWidth > 0) {
            img = prev;
            break;
          }
          const next = imagesRef.current[frameIndex + offset];
          if (next && next.complete && next.naturalWidth > 0) {
            img = next;
            break;
          }
        }
      }

      if (!img || !img.complete || img.naturalWidth === 0) {
        img = imagesRef.current[0];
      }

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, 1280, 720);
        activeFrameRef.current = frameIndex;
      }
    },
    [canvasRef]
  );

  useEffect(() => {
    let isCancelled = false;

    // Eagerly preload frame 1 and blit immediately to prevent black flash
    const firstImg = new Image();
    firstImg.src = getFramePath(0);
    firstImg.onload = () => {
      if (isCancelled) return;
      imagesRef.current[0] = firstImg;
      renderFrame(0);
    };

    // Background download of remaining 119 frames
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        if (isCancelled) return;
        imagesRef.current[i] = img;
      };
    }

    return () => {
      isCancelled = true;
    };
  }, [renderFrame]);

  return { renderFrame, imagesRef };
}

// ─── CARD INTERACTIVE 3D TILT HANDLERS ───────────────────────────────────────
export const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const xPercent = (x / rect.width - 0.5) * 2;
  const yPercent = (y / rect.height - 0.5) * 2;

  gsap.to(card, {
    rotateY: xPercent * 7,
    rotateX: -yPercent * 7,
    transformPerspective: 1000,
    duration: 0.35,
    ease: "power2.out",
  });

  const glow = card.querySelector<HTMLElement>(".card-spotlight");
  if (glow) {
    glow.style.opacity = "1";
    glow.style.background = `radial-gradient(350px circle at ${x}px ${y}px, rgba(168, 85, 247, 0.16), transparent 70%)`;
  }
};

export const handleCardMouseLeave = (
  e: React.MouseEvent<HTMLDivElement>,
  defaultRotateY = 0
) => {
  const card = e.currentTarget;
  gsap.to(card, {
    rotateY: defaultRotateY,
    rotateX: 0,
    duration: 0.5,
    ease: "power2.out",
  });

  const glow = card.querySelector<HTMLElement>(".card-spotlight");
  if (glow) {
    glow.style.opacity = "0";
  }
};

// ─── TIMELINE INTEGRATOR: APPENDS OUR SERVICES PHASES 1-4 TO MASTER TIMELINE ──
export function addServicesToTimeline({
  timeline,
  startTime,
  duration = 6.0,
  isMobile,
  canvasContainer,
  ambientGlow,
  cardTop,
  cardLeft,
  cardRight,
  frameCounter,
  renderFrame,
  setActiveMobileCard,
}: {
  timeline: gsap.core.Timeline;
  startTime: number;
  duration?: number;
  isMobile: boolean;
  canvasContainer: HTMLElement | null;
  ambientGlow: HTMLElement | null;
  cardTop: HTMLElement | null;
  cardLeft: HTMLElement | null;
  cardRight: HTMLElement | null;
  frameCounter: HTMLElement | null;
  renderFrame: (idx: number) => void;
  setActiveMobileCard?: (idx: number) => void;
}) {
  const frameData = { frame: 0 };

  // Base transforms setup
  if (!isMobile) {
    if (cardTop) {
      gsap.set(cardTop, {
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: -220,
        opacity: 0,
        scale: 0.88,
        filter: "blur(14px)",
        rotateX: 8,
      });
    }
    if (cardLeft) {
      gsap.set(cardLeft, {
        xPercent: -50,
        yPercent: -50,
        x: -380,
        y: 110,
        opacity: 0,
        scale: 0.88,
        filter: "blur(14px)",
        rotateY: 16,
      });
    }
    if (cardRight) {
      gsap.set(cardRight, {
        xPercent: -50,
        yPercent: -50,
        x: 380,
        y: 110,
        opacity: 0,
        scale: 0.88,
        filter: "blur(14px)",
        rotateY: -16,
      });
    }
    if (canvasContainer) {
      gsap.set(canvasContainer, {
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
      });
    }
  } else {
    if (canvasContainer) {
      gsap.set(canvasContainer, {
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
      });
    }
  }

  // Phase 1: Hero text dismissal
  timeline.to(
    ".services-hero-dismiss",
    {
      y: -70,
      opacity: 0,
      filter: "blur(12px)",
      stagger: 0.02,
      ease: "power3.inOut",
      duration: duration * 0.16,
    },
    startTime
  );

  // Phase 2: Frame Scrubbing
  timeline.to(
    frameData,
    {
      frame: TOTAL_FRAMES - 1,
      ease: "none",
      duration: duration * 0.82,
      onUpdate: () => {
        const idx = Math.round(frameData.frame);
        renderFrame(idx);
        if (frameCounter) {
          frameCounter.textContent = `FRM // ${String(idx + 1).padStart(3, "0")}`;
        }
      },
    },
    startTime + duration * 0.04
  );

  if (!isMobile) {
    // Phase 3: Canvas Morph to Center Card
    if (canvasContainer) {
      timeline.fromTo(
        canvasContainer,
        {
          width: "100vw",
          height: "100vh",
          borderRadius: "0px",
          borderColor: "rgba(168, 85, 247, 0)",
          boxShadow: "0 0 0 rgba(168, 85, 247, 0)",
          y: 0,
        },
        {
          width: 360,
          height: 480,
          borderRadius: "28px",
          borderColor: "rgba(168, 85, 247, 0.45)",
          boxShadow:
            "0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 50px rgba(168, 85, 247, 0.35)",
          y: 110,
          ease: "power3.inOut",
          duration: duration * 0.35,
        },
        startTime + duration * 0.35
      );
    }

    // Ambient violet bloom
    if (ambientGlow) {
      timeline.fromTo(
        ambientGlow,
        { opacity: 0, scale: 0.6, y: 70 },
        { opacity: 0.85, scale: 1.15, y: 70, ease: "power2.out", duration: duration * 0.32 },
        startTime + duration * 0.4
      );
    }

    // Phase 4: Staggered Flanking Card Docking
    if (cardTop) {
      timeline.to(
        cardTop,
        {
          opacity: 1,
          y: -220,
          scale: 1,
          filter: "blur(0px)",
          rotateX: 0,
          ease: "power3.out",
          duration: duration * 0.25,
        },
        startTime + duration * 0.65
      );
    }

    if (cardLeft) {
      timeline.to(
        cardLeft,
        {
          opacity: 1,
          x: -380,
          y: 110,
          scale: 1,
          filter: "blur(0px)",
          rotateY: 3,
          ease: "power3.out",
          duration: duration * 0.28,
        },
        startTime + duration * 0.72
      );
    }

    if (cardRight) {
      timeline.to(
        cardRight,
        {
          opacity: 1,
          x: 380,
          y: 110,
          scale: 1,
          filter: "blur(0px)",
          rotateY: -3,
          ease: "power3.out",
          duration: duration * 0.28,
        },
        startTime + duration * 0.78
      );
    }
  } else {
    // Mobile timeline adjustments
    if (canvasContainer) {
      timeline.fromTo(
        canvasContainer,
        {
          width: "100vw",
          height: "100vh",
          borderRadius: "0px",
          borderColor: "rgba(168, 85, 247, 0)",
          boxShadow: "0 0 0 rgba(168, 85, 247, 0)",
          y: 0,
        },
        {
          width: "90vw",
          maxWidth: "360px",
          height: "220px",
          borderRadius: "20px",
          borderColor: "rgba(168, 85, 247, 0.45)",
          boxShadow:
            "0 20px 40px -10px rgba(0, 0, 0, 0.9), 0 0 30px rgba(168, 85, 247, 0.25)",
          y: -150,
          ease: "power3.inOut",
          duration: duration * 0.35,
        },
        startTime + duration * 0.35
      );
    }

    timeline.fromTo(
      ".canvas-card-overlay",
      { opacity: 0 },
      { opacity: 1, duration: duration * 0.18 },
      startTime + duration * 0.6
    );

    timeline.fromTo(
      ".mobile-cards-container",
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, ease: "power3.out", duration: duration * 0.22 },
      startTime + duration * 0.6
    );

    if (setActiveMobileCard) {
      timeline.call(() => setActiveMobileCard(0), undefined, startTime + duration * 0.62);
      timeline.call(() => setActiveMobileCard(1), undefined, startTime + duration * 0.75);
      timeline.call(() => setActiveMobileCard(2), undefined, startTime + duration * 0.88);
    }
  }
}

// ─── BACKDROP COMPONENT (Positioned at z-0 behind the horizontal track) ────────
export interface OurServicesBackdropProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  ambientGlowRef: React.RefObject<HTMLDivElement | null>;
  cardTopRef: React.RefObject<HTMLDivElement | null>;
  cardLeftRef: React.RefObject<HTMLDivElement | null>;
  cardRightRef: React.RefObject<HTMLDivElement | null>;
  frameCounterRef: React.RefObject<HTMLSpanElement | null>;
  scale?: number;
}

export function OurServicesBackdrop({
  canvasRef,
  canvasContainerRef,
  ambientGlowRef,
  cardTopRef,
  cardLeftRef,
  cardRightRef,
  frameCounterRef,
  scale = 1,
}: OurServicesBackdropProps) {
  return (
    <div className="absolute inset-0 w-full h-full bg-transparent text-white select-none z-0">
      {/* PHASE 1: HERO SERVICES HEADING OVERLAY */}
      <div className="services-hero-dismiss absolute inset-0 z-30 flex flex-col justify-between py-24 px-8 md:px-16 pointer-events-none">
        <div className="w-full flex justify-center">
          <span className="services-hero-dismiss text-[11px] font-mono tracking-[0.3em] text-neutral-400 uppercase bg-neutral-900/60 backdrop-blur-md border border-neutral-800 px-4 py-1.5 rounded-full">
            Our Services
          </span>
        </div>

        <div className="services-hero-dismiss flex flex-col items-center justify-center flex-1 text-center">
          <h2 className="text-5xl sm:text-6xl md:text-[7.5vw] lg:text-[8vw] font-medium tracking-tighter leading-[0.88] text-white">
            A.I.
            <br />
            DESIGN
            <br />
            DEVELOPMENT
            <br />
            BRANDING
          </h2>
        </div>

        <div className="services-hero-dismiss flex items-center justify-between w-full pointer-events-auto max-w-7xl mx-auto">
          <div className="text-[10px] md:text-xs font-mono tracking-widest text-neutral-400 uppercase flex items-center gap-3">
            <span className="text-purple-400 text-xs">■</span> DESIGN WITH INTENT. BUILT TO WORK.
          </div>
          <TransitionLink
            href="/services"
            className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-neutral-300 hover:text-white transition-colors duration-300 group border-b border-neutral-800 pb-1 hover:border-purple-400"
          >
            VIEW SERVICES
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </TransitionLink>
        </div>
      </div>

      {/* PHASES 2, 3, 4: CANVAS & MORPHING 3D CLUSTER */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Ambient violet bloom behind center card - extended softly downward */}
        <div
          ref={ambientGlowRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full bg-purple-600/30 blur-[140px] pointer-events-none opacity-0 z-0"
        />

        {/* Scalable Container for Desktop Resiliency */}
        <div
          className="relative w-full h-full flex items-center justify-center pointer-events-none"
          style={{
            perspective: "1400px",
            transform: `scale(${scale})`,
          }}
        >
          {/* CENTRAL MORPHING CANVAS CONTAINER */}
          <div
            ref={canvasContainerRef}
            className="absolute top-1/2 left-1/2 overflow-hidden z-10 pointer-events-auto border transition-colors duration-300 group/canvas cursor-default"
            style={{
              width: "100vw",
              height: "100vh",
              borderRadius: "0px",
              borderColor: "rgba(168, 85, 247, 0)",
              backgroundColor: "#050505",
            }}
          >
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="w-full h-full object-cover select-none"
            />

            {/* Overlaid subtle glass reflection */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent opacity-60" />
          </div>

          {/* CARD 1: TOP // ARCHITECTURE */}
          <div
            ref={cardTopRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={(e) => handleCardMouseLeave(e, 0)}
            className="absolute top-1/2 left-1/2 z-20 pointer-events-auto rounded-3xl p-6 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 hover:border-purple-500/40 transition-colors duration-500 shadow-2xl overflow-hidden group cursor-pointer"
            style={{
              width: "480px",
              height: "160px",
            }}
          >
            <div className="card-spotlight absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-[0.2em] text-purple-400 bg-purple-950/40 border border-purple-500/20 px-3 py-0.5 rounded-full">
                  {serviceCards[0].tag}
                </span>
                <TransitionLink
                  href={serviceCards[0].link}
                  className="text-[10px] font-mono tracking-wider text-neutral-400 group-hover:text-purple-300 transition-colors flex items-center gap-1.5"
                >
                  {serviceCards[0].linkText}
                </TransitionLink>
              </div>

              <div>
                <h3 className="text-base font-normal tracking-tight text-white group-hover:text-purple-100 transition-colors">
                  {serviceCards[0].title}
                </h3>
                <p className="text-xs font-light text-neutral-400 mt-1 line-clamp-1">
                  {serviceCards[0].description}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {serviceCards[0].pills.map((pill) => (
                  <span
                    key={pill}
                    className="text-[10px] font-mono text-neutral-300 bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-md"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CARD 2: LEFT // CREATIVE ENGINE */}
          <div
            ref={cardLeftRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={(e) => handleCardMouseLeave(e, 3)}
            className="absolute top-1/2 left-1/2 z-20 pointer-events-auto rounded-3xl p-7 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 hover:border-purple-500/40 transition-colors duration-500 shadow-2xl overflow-hidden group cursor-pointer flex flex-col justify-between"
            style={{
              width: "340px",
              height: "420px",
            }}
          >
            <div className="card-spotlight absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono tracking-[0.2em] text-purple-400 bg-purple-950/40 border border-purple-500/20 px-3 py-1 rounded-full">
                    {serviceCards[1].tag}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">02</span>
                </div>

                <h3 className="text-xl font-normal tracking-tight text-white mb-3 group-hover:text-purple-100 transition-colors leading-snug">
                  {serviceCards[1].title}
                </h3>

                <p className="text-xs font-light text-neutral-400 leading-relaxed">
                  {serviceCards[1].description}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-1.5">
                  {serviceCards[1].pills.map((pill) => (
                    <span
                      key={pill}
                      className="text-[10px] font-mono text-neutral-300 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded-md"
                    >
                      {pill}
                    </span>
                  ))}
                </div>

                <TransitionLink
                  href={serviceCards[1].link}
                  className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-neutral-400 group-hover:text-white transition-colors"
                >
                  {serviceCards[1].linkText}
                </TransitionLink>
              </div>
            </div>
          </div>

          {/* CARD 3: RIGHT // INFRASTRUCTURE */}
          <div
            ref={cardRightRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={(e) => handleCardMouseLeave(e, -3)}
            className="absolute top-1/2 left-1/2 z-20 pointer-events-auto rounded-3xl p-7 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 hover:border-purple-500/40 transition-colors duration-500 shadow-2xl overflow-hidden group cursor-pointer flex flex-col justify-between"
            style={{
              width: "340px",
              height: "420px",
            }}
          >
            <div className="card-spotlight absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono tracking-[0.2em] text-purple-400 bg-purple-950/40 border border-purple-500/20 px-3 py-1 rounded-full">
                    {serviceCards[2].tag}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">03</span>
                </div>

                <h3 className="text-xl font-normal tracking-tight text-white mb-3 group-hover:text-purple-100 transition-colors leading-snug">
                  {serviceCards[2].title}
                </h3>

                <p className="text-xs font-light text-neutral-400 leading-relaxed">
                  {serviceCards[2].description}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-1.5">
                  {serviceCards[2].pills.map((pill) => (
                    <span
                      key={pill}
                      className="text-[10px] font-mono text-neutral-300 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded-md"
                    >
                      {pill}
                    </span>
                  ))}
                </div>

                <TransitionLink
                  href={serviceCards[2].link}
                  className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-neutral-400 group-hover:text-white transition-colors"
                >
                  {serviceCards[2].linkText}
                </TransitionLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MOBILE SERVICES SECTION (Rendered directly after projects in mobile view) ─
export function OurServicesMobileSection({
  canvasRef,
  activeMobileCard,
  setActiveMobileCard,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  activeMobileCard: number;
  setActiveMobileCard: (idx: number) => void;
}) {
  return (
    <div className="w-full flex flex-col items-center py-16 px-4 bg-transparent border-t border-neutral-900 mt-12">
      {/* Mobile Title */}
      <span className="text-[10px] font-mono tracking-[0.25em] text-purple-400 uppercase mb-3 block">
        Our Services
      </span>
      <h2 className="text-3xl font-light tracking-tight text-white mb-8 text-center">
        Engineered for Impact
      </h2>

      {/* Mobile Video Card */}
      <div className="w-full max-w-[360px] h-[220px] rounded-2xl overflow-hidden border border-purple-500/40 relative shadow-2xl mb-8 bg-black">
        <video
          src="/innovelous_2.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Tabs / Card Selector */}
      <div className="flex items-center gap-2 mb-4">
        {serviceCards.map((c, idx) => (
          <button
            key={c.id}
            onClick={() => setActiveMobileCard(idx)}
            className={`text-[10px] font-mono px-3 py-1 rounded-full transition-all duration-300 border ${
              activeMobileCard === idx
                ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-lg shadow-purple-500/20"
                : "bg-neutral-900/60 text-neutral-500 border-neutral-800"
            }`}
          >
            {c.id}
          </button>
        ))}
      </div>

      {/* Active Card Body */}
      <div className="w-full max-w-[360px] rounded-2xl p-5 bg-[#0a0a0a] border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-mono tracking-[0.2em] text-purple-400 bg-purple-950/40 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
            {serviceCards[activeMobileCard].tag}
          </span>
          <span className="text-[10px] font-mono text-neutral-500">
            {serviceCards[activeMobileCard].id} / 03
          </span>
        </div>

        <h3 className="text-base font-normal tracking-tight text-white mb-2 leading-snug">
          {serviceCards[activeMobileCard].title}
        </h3>

        <p className="text-xs font-light text-neutral-400 mb-4 leading-relaxed">
          {serviceCards[activeMobileCard].description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {serviceCards[activeMobileCard].pills.map((p) => (
            <span
              key={p}
              className="text-[9px] font-mono text-neutral-300 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded-md"
            >
              {p}
            </span>
          ))}
        </div>

        <TransitionLink
          href={serviceCards[activeMobileCard].link}
          className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-purple-300 underline underline-offset-4"
        >
          {serviceCards[activeMobileCard].linkText}
        </TransitionLink>
      </div>
    </div>
  );
}

// ─── DEFAULT EXPORT: STANDALONE SECTION (if ever placed individually) ─────────
export default function OurServicesScrollSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);
  const cardTopRef = useRef<HTMLDivElement>(null);
  const cardLeftRef = useRef<HTMLDivElement>(null);
  const cardRightRef = useRef<HTMLDivElement>(null);
  const frameCounterRef = useRef<HTMLSpanElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);
  const [activeMobileCard, setActiveMobileCard] = useState(0);

  const { renderFrame } = useFramePreloader(canvasRef);

  useEffect(() => {
    const handleResize = () => {
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
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: isMobile ? "+=2600" : "+=3800",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      addServicesToTimeline({
        timeline: masterTl,
        startTime: 0,
        duration: 4.0,
        isMobile,
        canvasContainer: canvasContainerRef.current,
        ambientGlow: ambientGlowRef.current,
        cardTop: cardTopRef.current,
        cardLeft: cardLeftRef.current,
        cardRight: cardRightRef.current,
        frameCounter: frameCounterRef.current,
        renderFrame,
        setActiveMobileCard,
      });
    }, section);

    return () => ctx.revert();
  }, [isMobile, renderFrame]);

  if (isMobile) {
    return (
      <section ref={sectionRef} className="relative w-full">
        <OurServicesMobileSection
          canvasRef={canvasRef}
          activeMobileCard={activeMobileCard}
          setActiveMobileCard={setActiveMobileCard}
        />
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative w-full h-screen overflow-hidden bg-transparent">
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
    </section>
  );
}
