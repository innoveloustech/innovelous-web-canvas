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

interface PracticeArea {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
  link: string;
  linkText: string;
}

const practices: PracticeArea[] = [
  {
    id: "01",
    badge: "Web & Mobile",
    title: "Web Platforms & Mobile Apps",
    tagline: "Fast, dependable software your users love to use.",
    description:
      "We design and build fast-loading websites, customer portals, and mobile apps from scratch. Clean architecture, zero bloat, and rock-solid reliability across every screen.",
    deliverables: [
      "Custom Web Applications",
      "iOS & Android Mobile Apps",
      "Interactive Client Dashboards",
      "Fast & Secure APIs",
      "Scalable Cloud Hosting",
    ],
    link: "/solutions/software",
    linkText: "EXPLORE APPS & WEB →",
  },
  {
    id: "02",
    badge: "AI & Automation",
    title: "Practical AI & Automation",
    tagline: "Cut busywork and give your team superpowers.",
    description:
      "No hype or empty buzzwords. We build smart workflows that automate repetitive paperwork, speed up customer support, and organize messy internal company data.",
    deliverables: [
      "Internal AI Workflows",
      "Document Automation",
      "Customer Support Bots",
      "Smart Data Pipelines",
      "Secure Private Models",
    ],
    link: "/solutions/software",
    linkText: "SEE AI SOLUTIONS →",
  },
  {
    id: "03",
    badge: "Hardware & IoT",
    title: "Connected Devices & IoT",
    tagline: "Connecting your physical equipment to the cloud.",
    description:
      "From prototyping custom hardware sensors to building live monitoring screens for factories, we make physical devices communicate reliably with the cloud.",
    deliverables: [
      "Custom Sensor Integration",
      "Live Monitoring Screens",
      "Device Remote Control",
      "Hardware Firmware",
      "Industrial Telemetry",
    ],
    link: "/solutions/hardware",
    linkText: "EXPLORE HARDWARE →",
  },
  {
    id: "04",
    badge: "Product Launch",
    title: "Fast MVPs for Startups",
    tagline: "Go from an idea on paper to live users in weeks.",
    description:
      "Need to test a new product idea quickly? We help founders and innovators design, build, and launch high-quality prototypes without wasting months or budget.",
    deliverables: [
      "Rapid Prototype Delivery",
      "MVP Engineering",
      "User-Friendly UI/UX",
      "Launch & Scalability Strategy",
      "Production-Ready Code",
    ],
    link: "/projects",
    linkText: "VIEW ALL PROJECTS →",
  },
];

export default function CapabilitiesFallback() {
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
      if (!sectionRef.current) return;

      const mm = gsap.matchMedia();

      // DESKTOP: Only pin and animate horizontal track on screens >= 768px
      mm.add("(min-width: 768px)", () => {
        if (!pinRef.current || !trackRef.current) return;
        const track = trackRef.current;
        const panelVW = window.innerWidth * 0.5;
        const totalPanels = practices.length + 2;
        const endX = -totalPanels * panelVW;
        const scrollDistance = Math.abs(endX);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinRef.current,
            start: "top top",
            end: "+=" + (scrollDistance + 3800),
            scrub: 1.2,
            pin: true,
            pinSpacing: true,
            pinType: "transform",
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // 1. Move the horizontal scroll track so that all cards slide off to reveal background
        tl.to(
          track,
          {
            x: endX,
            ease: "none",
            duration: totalPanels,
          },
          0
        );

        // 2. Progress bar
        const cardsDuration = Math.max(1, practices.length);
        tl.to(
          ".cap-progress-indicator",
          {
            width: "100%",
            ease: "none",
            duration: cardsDuration,
          },
          0
        );

        tl.to(
          ".cap-progress-container",
          {
            opacity: 0,
            ease: "power2.out",
            duration: 0.5,
          },
          cardsDuration + 0.2
        );

        // 4. Rising cards as they enter view
        const panels = track.querySelectorAll<HTMLElement>(".cap-panel");
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

        // 5. Our Services narrative unfolds behind the sliding cards
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

      // MOBILE: Simple card fade-in, ZERO pinning, ZERO extra scroll space
      mm.add("(max-width: 767px)", () => {
        gsap.fromTo(
          ".cap-panel",
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
    { scope: sectionRef, dependencies: [isMobile, renderFrame] }
  );

  // ─── MOBILE VIEW ─────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <section
        ref={sectionRef}
        className="relative w-full bg-zinc-950 py-20 text-white overflow-hidden"
      >
        <div className="px-6 mb-12">
          <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase block mb-3">
            What We Do
          </span>
          <h2 className="text-3xl font-light tracking-tight leading-tight text-white max-w-xs">
            How we help businesses build and grow
          </h2>
        </div>

        <div className="flex flex-col gap-6 px-6">
          {practices.map((item) => (
            <div
              key={item.id}
              className="cap-panel rounded-2xl bg-zinc-900 border border-neutral-800 p-7 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-purple-400 border border-purple-500/30 bg-purple-950/20 px-3 py-1 rounded-full">
                    {item.badge}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {item.id}
                  </span>
                </div>

                <h3 className="text-2xl font-light tracking-tight text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs font-light text-neutral-300 mb-4">
                  {item.tagline}
                </p>
                <p className="text-sm text-neutral-400 font-light leading-relaxed mb-6">
                  {item.description}
                </p>

                <div className="mb-6">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 block mb-2.5">
                    What We Deliver:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {item.deliverables.map((d) => (
                      <span
                        key={d}
                        className="text-xs font-light text-neutral-300 bg-zinc-950 border border-neutral-800 px-3 py-1.5 rounded-xl"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                <TransitionLink
                  href={item.link}
                  className="text-[10px] font-mono tracking-widest uppercase text-neutral-300 hover:text-white transition-colors underline underline-offset-4"
                >
                  {item.linkText}
                </TransitionLink>
              </div>
            </div>
          ))}

          {/* End card */}
          <div className="cap-panel rounded-2xl bg-zinc-900 border border-neutral-800 p-10 flex flex-col justify-center items-center text-center space-y-5 min-h-[240px]">
            <p className="text-xl font-light text-neutral-300 leading-snug max-w-[240px]">
              Have an idea in mind? We would love to hear what you are working on.
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

  // ─── DESKTOP VIEW ────────────────────────────────────────────────────────────
  const totalPanels = practices.length + 2;

  return (
    <section ref={sectionRef} className="relative w-full text-white bg-transparent">
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

        {/* Horizontal scroll progress indicator */}
        <div className="cap-progress-container absolute bottom-8 left-14 right-14 z-20 pointer-events-none hidden md:flex items-center gap-4">
          <span className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">
            01
          </span>
          <div className="flex-1 h-[2px] bg-neutral-900/80 rounded-full overflow-hidden">
            <div className="cap-progress-indicator h-full w-0 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full" />
          </div>
          <span className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">
            {String(practices.length).padStart(2, "0")}
          </span>
        </div>

        {/* 2. FULL-WIDTH horizontally scrolling track - Solid seamless 50vw panels */}
        <div
          className="absolute top-0 left-0 h-full z-10 pointer-events-none"
          style={{ width: totalPanels * 50 + "vw" }}
        >
          <div
            ref={trackRef}
            className="flex h-full will-change-transform pointer-events-auto bg-zinc-950"
            style={{ width: totalPanels * 50 + "vw" }}
          >
            {/* Panel 0: Title panel — w-50vw, full height, zinc-950 */}
            <div className="cap-panel flex-shrink-0 w-[50vw] h-full flex flex-col justify-between px-14 xl:px-20 py-24 bg-zinc-950 border-r border-neutral-900/60">
              <div>
                <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase block mb-5">
                  What We Do
                </span>
                <h2 className="text-5xl xl:text-6xl 2xl:text-7xl font-light tracking-tight leading-[1.05] text-white max-w-md">
                  Everything you need to turn an idea into reality
                </h2>
                <p className="text-neutral-400 text-base font-light leading-relaxed mt-6 max-w-sm">
                  We are a dedicated software and hardware studio. Whether you need a full web app, smart automations, or connected hardware, our team handles it end to end.
                </p>
              </div>

              <TransitionLink
                href="/projects"
                className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-neutral-400 hover:text-white transition-colors duration-300 group w-fit border-b border-neutral-800 pb-1 hover:border-white"
              >
                EXPLORE OUR PROJECTS
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </TransitionLink>
            </div>

            {/* Practice panels — each 50vw, solid zinc-950 with border divider, zero gaps */}
            {practices.map((item, i) => (
              <div
                key={item.id}
                className="cap-panel flex-shrink-0 w-[50vw] h-full flex flex-col justify-between py-24 px-12 xl:px-16 bg-zinc-950 border-r border-neutral-900/60"
              >
                {/* Top section: badge & index */}
                <div>
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-900">
                    <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-purple-400 border border-purple-500/30 bg-purple-950/20 px-3.5 py-1.5 rounded-full">
                      {item.badge}
                    </span>
                    <span className="text-xs font-mono text-neutral-500">
                      0{i + 1}
                    </span>
                  </div>

                  <h3 className="text-3xl xl:text-4xl 2xl:text-5xl font-light tracking-tight text-white leading-tight mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm xl:text-base font-light text-neutral-300 mb-6">
                    {item.tagline}
                  </p>
                  <p className="text-sm xl:text-base text-neutral-400 font-light leading-relaxed max-w-md mb-10">
                    {item.description}
                  </p>

                  {/* Deliverables tags */}
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase block mb-3">
                      What We Deliver:
                    </span>
                    <div className="flex flex-wrap gap-2.5 max-w-md">
                      {item.deliverables.map((d) => (
                        <span
                          key={d}
                          className="text-xs font-light text-neutral-300 bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom link */}
                <div className="pt-8 border-t border-neutral-900 flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-widest text-neutral-600 uppercase">
                    INNOVELOUS PRACTICE
                  </span>
                  <TransitionLink
                    href={item.link}
                    className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-neutral-400 hover:text-white transition-colors duration-300 group border-b border-neutral-800 pb-0.5 hover:border-white whitespace-nowrap"
                  >
                    {item.linkText}
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </TransitionLink>
                </div>
              </div>
            ))}

            {/* End discovery panel — w-50vw, full height, solid zinc-950 */}
            <div className="cap-panel flex-shrink-0 w-[50vw] h-full flex flex-col justify-center items-start px-14 xl:px-20 bg-zinc-950 border-l border-neutral-900/60">
              <div className="w-10 h-px bg-neutral-800 mb-8" />
              <p className="text-3xl xl:text-4xl font-light text-neutral-300 leading-snug max-w-sm mb-8">
                Ready to bring your next product or project to life?
              </p>
              <TransitionLink
                href="/projects"
                className="inline-flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-neutral-400 hover:text-white transition-colors duration-300 group border-b border-neutral-800 pb-1 hover:border-white"
              >
                SEE COMPLETED WORK
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </TransitionLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
