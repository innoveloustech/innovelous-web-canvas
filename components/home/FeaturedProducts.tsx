"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
}

const products: Product[] = [
  {
    id: "01",
    name: "Synapse AI",
    tagline: "Intelligent Workflow Engine",
    description:
      "An AI-powered automation platform that learns from your team's patterns to eliminate repetitive tasks and surface actionable insights in real time.",
    tags: ["AI/ML", "Automation", "SaaS"],
  },
  {
    id: "02",
    name: "Prism Commerce",
    tagline: "Headless Retail Suite",
    description:
      "A blazing-fast headless commerce stack built on edge infrastructure, delivering sub-50ms page loads and conversion-optimized checkout flows.",
    tags: ["E-Commerce", "Edge", "Payments"],
  },
  {
    id: "03",
    name: "Vaultkeep",
    tagline: "Zero-Trust Data Vault",
    description:
      "End-to-end encrypted storage and collaboration platform designed for regulated industries where data sovereignty is non-negotiable.",
    tags: ["Security", "Encryption", "Compliance"],
  },
  {
    id: "04",
    name: "Lumina Analytics",
    tagline: "Real-Time BI Dashboard",
    description:
      "Unified business intelligence layer that ingests data from dozens of sources and renders interactive, drill-down dashboards with zero setup overhead.",
    tags: ["Analytics", "Data Viz", "Real-Time"],
  },
];

export default function FeaturedProducts() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-zinc-950 py-24 md:py-36 text-neutral-100 overflow-hidden border-t border-neutral-900"
    >
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-900/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div
          ref={headerRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start pb-16 md:pb-24 border-b border-neutral-900"
        >
          <div className="lg:col-span-4">
            <span className="text-xs font-mono tracking-[0.2em] text-neutral-500 uppercase">
              Featured Work
            </span>
          </div>
          <div className="lg:col-span-8">
            <h2 className="text-3xl md:text-5xl font-light tracking-tight leading-[1.15] text-neutral-200 max-w-3xl">
              A curated selection of products we&apos; engineered from concept
              to production — each built for scale, speed, and real-world
              impact.
            </h2>
          </div>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-16 md:pt-20"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="relative rounded-2xl border border-neutral-800/60 bg-neutral-900/30 backdrop-blur-sm p-8 md:p-10 flex flex-col justify-between space-y-8"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-600">
                    {product.id}
                  </span>
                  <div className="w-8 h-[1px] bg-neutral-700" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl md:text-3xl font-light tracking-tight text-neutral-100">
                    {product.name}
                  </h3>
                  <p className="text-sm font-mono text-purple-400/80 tracking-wide">
                    {product.tagline}
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-neutral-400 font-light max-w-md">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-mono px-3 py-1 rounded-full border border-neutral-800 text-neutral-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button className="text-xs font-mono tracking-wider uppercase px-5 py-2.5 rounded-full border border-neutral-700 text-neutral-300 cursor-pointer transition-colors duration-300 hover:border-purple-500/60 hover:text-purple-300">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
