"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "@/lib/supabase";

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

export default function FeaturedProducts() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeaturedProjects() {
      try {
        const { data, error: fetchError } = await supabase
          .from("projects_new")
          .select("*")
          .eq("is_featured", true)
          .order("sort_order", { ascending: true });

        if (fetchError) throw fetchError;

        if (data) {
          const mapped: Project[] = data.map((p: any) => ({
            id: p.id,
            name: p.title,
            tagline: p.category,
            description: p.description,
            tags: [p.category],
            image_url: p.image_url,
            link: p.link,
            color: p.color,
          }));
          setProjects(mapped);
        }
      } catch (err: any) {
        console.error("Failed to fetch featured projects:", err.message);
        setError("Database connection failed. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProjects();
  }, []);

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
  }, [projects]);

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
              A curated selection of products we've engineered from concept
              to production — each built for scale, speed, and real-world
              impact.
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 animate-pulse">
              Loading featured projects...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 border border-red-500/20 bg-red-500/[0.02] rounded-3xl mt-16">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-red-400 mb-2">Database Connection Failed</p>
            <p className="text-neutral-400 text-sm font-light text-center max-w-md leading-relaxed">
              {error}
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center py-20 border border-dashed border-white/5 rounded-3xl mt-16">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-600">
              No featured projects available yet.
            </p>
          </div>
        ) : (
          <div
            ref={cardsRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-16 md:pt-20"
          >
            {projects.map((product) => (
              <div
                key={product.id}
                className="relative rounded-2xl border border-neutral-800/60 bg-neutral-900/30 backdrop-blur-sm p-8 md:p-10 flex flex-col justify-between space-y-8"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-neutral-600">
                      {String(product.id).padStart(2, "0")}
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

                  {product.link && (
                    <a
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono tracking-wider uppercase px-5 py-2.5 rounded-full border border-neutral-700 text-neutral-300 cursor-pointer transition-colors duration-300 hover:border-purple-500/60 hover:text-purple-300"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}