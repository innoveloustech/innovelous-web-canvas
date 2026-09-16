"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import CanvasBackground from "@/components/canvas-background";
import Navbar from "@/components/navbar";
import Cursor from "@/components/MouseFollower";
import ContactSection from "@/components/ContactSection";
import WhatsAppButton from "@/components/whatsapp-button";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Solution } from "@/lib/types/solutions";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ClientLayoutProps {
  data: Solution;
}

export default function SolutionClientWrapper({ data }: ClientLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scaleCardRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  useGSAP(
    () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      // 1. Hero Initial Entrance
      const tl = gsap.timeline();
      tl.from(".solution-nav", { y: -50, opacity: 0, duration: 1, ease: "power3.out" })
        .from(".solution-hero-title .line", {
          y: 60,
          opacity: 0,
          stagger: 0.08,
          duration: 0.9,
          ease: "power3.out",
        }, "-=0.6")
        .from(".solution-meta", { x: -30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.8")
        .from(".solution-desc", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.5")
        .from(".stat-card", {
          y: 40,
          opacity: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
        }, "-=0.6");

      // 2. Hero Scroll Parallax
      gsap.to(".solution-hero-content", {
        y: -70,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: ".solution-hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      // 3. Features Stagger Entrance on Scroll
      gsap.from(".feature-row", {
        scrollTrigger: {
          trigger: ".details-grid-section",
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
        x: -30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
      });

      // 4. Scale Card Entrance
      gsap.from(".scale-card-box", {
        scrollTrigger: {
          trigger: ".details-grid-section",
          start: "top 72%",
          toggleActions: "play none none reverse",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      // 5. 3D Tilt on Scale Card Box
      const scaleCard = scaleCardRef.current;
      if (scaleCard) {
        const move = (e: MouseEvent) => {
          const rect = scaleCard.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(scaleCard, {
            rotateY: x * 8,
            rotateX: -y * 8,
            duration: 0.3,
            ease: "power2.out",
            transformPerspective: 900,
          });
        };
        const leave = () => {
          gsap.to(scaleCard, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power3.out" });
        };
        scaleCard.addEventListener("mousemove", move);
        scaleCard.addEventListener("mouseleave", leave);
      }
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <WhatsAppButton phoneNumber="+92 334 9251936" />
      <Cursor />
      <CanvasBackground />
      
      <div className="solution-nav sticky top-0 z-50">
        <Navbar />
      </div>

          <main className="relative z-10">
            {/* HERO SECTION */}
            <section className="solution-hero-section min-h-screen flex flex-col justify-end px-6 md:px-16 pb-20 md:pb-32 pt-32">
              <div className="solution-hero-content max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
                  <div className="flex flex-col lg:col-span-12 justify-center">
                    <div className="solution-meta flex items-center gap-4 mb-6">
                      <span
                        className="text-xs font-mono tracking-[0.25em] uppercase px-3 py-1 border rounded-full text-white border-white"
                      >
                        {data.label}
                      </span>
                      <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                        {data.category}
                      </span>
                    </div>

                <h1 className="solution-hero-title text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] mb-8">
                  {data.title.split('\n').map((line, i) => (
                    <span key={i} className="line block overflow-hidden">
                      <span className="inline-block" style={{ willChange: "transform, opacity" }}>{line}</span>
                    </span>
                  ))}
                </h1>

                    <p className="solution-desc text-neutral-400 text-lg md:text-xl max-w-xl font-light leading-relaxed mb-12">
                      {data.description}
                    </p>

                    <div className="flex gap-6 md:gap-10 border-t border-neutral-800 pt-8 w-full md:w-auto self-start">
                  {data.stats.map((stat, i) => (
                        <div key={i} className="stat-card flex flex-col gap-1">
                          <span className="text-2xl md:text-4xl font-light tracking-tight text-white">{stat.value}</span>
                          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* DETAILS GRID */}
            <section className="details-grid-section min-h-screen bg-[#050505] relative px-6 md:px-16 py-32 rounded-t-3xl border-t border-neutral-900 z-20">
              <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                <div className="flex flex-col gap-0 opacity-100">
                  <span
                    className="text-xs font-mono tracking-[0.25em] uppercase mb-8 block text-white"
                  >
                    Capabilities & Tech
                  </span>
                  
                  <div className="flex flex-col">
                {data.features.map((feature, i) => (
                      <div data-cursor="-exclusion" key={i} className="feature-row group flex items-center justify-between py-5 border-b border-neutral-800 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-mono text-neutral-600">0{i + 1}</span>
                          <h3 
                            className="text-xl md:text-2xl font-normal text-white transition-colors duration-300 group-hover:text-[var(--hover-color)]"
                        style={{ "--hover-color": "#ffffff" } as React.CSSProperties}
                          >
                            {feature}
                          </h3>
                        </div>
                        <svg
                          className="w-5 h-5 text-neutral-700 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--hover-color)]"
                      style={{ "--hover-color": "#ffffff" } as React.CSSProperties}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative flex flex-col justify-center">
                  <div ref={scaleCardRef} className="scale-card-box p-8 md:p-12 rounded-3xl border border-neutral-800 bg-[#0c0c0c] backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30">
                    <h3 className="text-3xl md:text-4xl font-light mb-4 tracking-tight">
                      Ready to Scale?
                    </h3>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-8">
                      Our engineering team is ready to deploy this solution into your infrastructure. 
                      We handle everything from architecture design to production rollout.
                    </p>
                    
                    <div className="solution-cta-btn">
                      <button className="group relative flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold text-sm overflow-hidden transition-transform hover:scale-105">
                        <span
                          className="absolute inset-0 w-0 bg-[var(--hover-color)] group-hover:w-full transition-all duration-500 ease-out"
                      style={{ "--hover-color": "#333333" } as React.CSSProperties}
                        />
                    <span className="relative z-10 group-hover:text-white transition-colors">{data.cta_text}</span>
                        <svg className="relative z-10 w-4 h-4 text-black group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mt-12 flex items-center justify-between border-t border-neutral-800 pt-8">
                    <a data-cursor="-exclusion" href="#contact" className="text-xs font-mono text-neutral-500 hover:text-white transition-colors flex items-center gap-2">
                      <span>↓</span> Contact Us
                    </a>
                    <Link data-cursor="-exclusion" href="/" className="text-xs font-mono text-neutral-500 hover:text-white transition-colors flex items-center gap-2">
                      Back to Home <span>↑</span>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section id="contact">
              <ContactSection showCapabilities={false} />
            </section>
          </main>
    </div>
  );
}