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

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Animate the upper editorial header
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // 2. Animate the metric cards with a luxurious, staggered fade-up
      if (cardsRef.current) {
        const cards = cardsRef.current.children;
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.4,
            stagger: 0.15,
            ease: "power4.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert(); // Clean up GSAP context on unmount to prevent memory leaks
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-zinc-950 py-24 md:py-36 text-neutral-100 overflow-hidden border-t border-neutral-900"
    >
      {/* Subtle, soft background ambient glow to pull it away from flat black */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neutral-900/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* UPPER EDITORIAL HEADER */}
        <div
          ref={headerRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start pb-16 md:pb-24 border-b border-neutral-900"
        >
          <div className="lg:col-span-4">
            <span className="text-xs font-mono tracking-[0.2em] text-neutral-500 uppercase">
              Proven Outcomes
            </span>
          </div>
          <div className="lg:col-span-8">
            <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-[1.15] text-neutral-200 max-w-3xl">
              We don&apos;t measure the success of a project solely by the cleanliness of our code, but by the tangible momentum it brings to your business.
            </h2>
          </div>
        </div>

        {/* METRICS GRID */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16 pt-16 md:pt-20"
        >
          {metrics.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between items-start space-y-6 md:space-y-8"
            >
              <div className="space-y-4">
                {/* ID/Number Indicator */}
                <span className="block text-xs font-mono text-neutral-600 transition-colors duration-300 group-hover:text-neutral-400">
                  {item.id}
                </span>

                {/* Massive, Highly Legible Metric Accent */}
                <div className="text-6xl lg:text-7xl xl:text-8xl font-extralight tracking-tighter text-neutral-100 transition-transform duration-500 ease-out group-hover:translate-x-1">
                  {item.metric}
                </div>
              </div>

              {/* Text Context */}
              <div className="space-y-2">
                <h3 className="text-lg font-normal tracking-tight text-neutral-200">
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
