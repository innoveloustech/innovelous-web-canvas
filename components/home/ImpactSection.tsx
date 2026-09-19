"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Safely register ScrollTrigger for Next.js SSR
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface MetricItem {
  id: string;
  metric: string;
  label: string;
  description: string;
}

const metrics: MetricItem[] = [
  {
    id: "01",
    metric: "100%",
    label: "Partnership Retention",
    description:
      "Every partner we collaborate with chooses to retain our team for continuous scaling, optimization, and post-launch support.",
  },
  {
    id: "02",
    metric: "2-3x",
    label: "Faster Deployment",
    description:
      "By engineering custom, static-first architectures, we bypass legacy framework bloat to deploy high-performing systems at record speeds.",
  },
  {
    id: "03",
    metric: "Zero",
    label: "Missed Deadlines",
    description:
      "We treat your launch window as a sacred commitment. Precision workflow architecture meets rigorous, transparent execution.",
  },
];

export default function ImpactSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Animate the upper editorial header
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // 2. Animate divider line wipe
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.3,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // 3. Animate the metric cards with staggered entry & animated number counting
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll<HTMLElement>(".metric-card");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.18,
            ease: "power4.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
              onEnter: () => {
                // Animate count up for 100%
                const countObj = { val: 0 };
                const numEl = cardsRef.current?.querySelector(".metric-counter-100");
                if (numEl) {
                  gsap.to(countObj, {
                    val: 100,
                    duration: 1.6,
                    ease: "power2.out",
                    onUpdate: () => {
                      numEl.textContent = `${Math.round(countObj.val)}%`;
                    },
                  });
                }
              },
            },
          }
        );

        // 4. Interactive 3D tilt on card mousemove
        cards.forEach((card) => {
          const numEl = card.querySelector<HTMLElement>(".metric-num");
          const move = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            gsap.to(card, {
              rotateY: x * 8,
              rotateX: -y * 8,
              duration: 0.3,
              ease: "power2.out",
              transformPerspective: 800,
            });
            if (numEl) {
              gsap.to(numEl, {
                x: x * 12,
                color: "#c084fc",
                duration: 0.3,
                ease: "power2.out",
              });
            }
          };
          const leave = () => {
            gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" });
            if (numEl) {
              gsap.to(numEl, { x: 0, color: "#f5f5f5", duration: 0.4, ease: "power2.out" });
            }
          };
          card.addEventListener("mousemove", move);
          card.addEventListener("mouseleave", leave);
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-transparent py-24 md:py-36 text-neutral-100 overflow-x-clip"
    >
      {/* Continuous ambient purple glow bridging seamlessly from Our Services into ImpactSection */}
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[850px] md:w-[1200px] h-[500px] rounded-full bg-purple-600/25 blur-[140px] pointer-events-none" />

      {/* Soft background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-950/20 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* UPPER EDITORIAL HEADER */}
        <div
          ref={headerRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start pb-16 md:pb-24"
        >
          <div className="lg:col-span-4">
            <span className="text-xs font-mono tracking-[0.2em] text-neutral-500 uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Proven Outcomes
            </span>
          </div>
          <div className="lg:col-span-8">
            <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-[1.15] text-neutral-200 max-w-3xl">
              We don&apos;t measure the success of a project solely by the cleanliness of our code, but by the tangible momentum it brings to your business.
            </h2>
          </div>
        </div>

        {/* Scaled divider line */}
        <div
          ref={lineRef}
          className="w-full h-px bg-neutral-900 origin-left"
        />

        {/* METRICS GRID */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16 pt-16 md:pt-20"
        >
          {metrics.map((item) => (
            <div
              key={item.id}
              className="metric-card group flex flex-col justify-between items-start space-y-6 md:space-y-8 p-6 rounded-2xl border border-transparent hover:border-neutral-900/60 hover:bg-white/[0.015] transition-colors duration-300"
            >
              <div className="space-y-4 w-full">
                {/* ID/Number Indicator */}
                <span className="block text-xs font-mono text-neutral-600 transition-colors duration-300 group-hover:text-purple-400">
                  {item.id}
                </span>

                {/* Massive, Highly Legible Metric Accent */}
                <div
                  className={`metric-num text-6xl lg:text-7xl xl:text-8xl font-extralight tracking-tighter text-neutral-100 transition-colors duration-300 ${
                    item.id === "01" ? "metric-counter-100" : ""
                  }`}
                >
                  {item.metric}
                </div>
              </div>

              {/* Text Context */}
              <div className="space-y-2">
                <h3 className="text-lg font-normal tracking-tight text-neutral-200 group-hover:text-white transition-colors duration-300">
                  {item.label}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-400 font-light max-w-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
