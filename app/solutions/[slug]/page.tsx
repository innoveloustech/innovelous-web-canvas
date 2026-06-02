"use client";
import { useParams } from "next/navigation";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { getSolutionData } from "@/lib/solutions-data";
import CanvasBackground from "@/components/canvas-background";
import Navbar from "@/components/navbar";
import Cursor from "@/components/MouseFollower";
import SolutionScene from "@/components/solutions/SolutionScenes";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ContactSection from "@/components/ContactSection";

// Dynamically import Aceternity Globe client component wrapper to shield from SSR issues
const DynamicGlobeViewport = dynamic(
  async () => {
    const { World } = await import("@/components/ui/globe");
    return function GlobeViewport() {
      const globeConfig = {
        pointSize: 4,
        globeColor: "#070708",
        showAtmosphere: true,
        atmosphereColor: "#a855f7",
        atmosphereAltitude: 0.1,
        emissive: "#060608",
        emissiveIntensity: 0.1,
        shininess: 0.9,
        polygonColor: "rgba(168, 85, 247, 0.4)",
        ambientLight: "#a855f7",
        directionalLeftLight: "#ffffff",
        directionalTopLight: "#ffffff",
        pointLight: "#a855f7",
        arcTime: 2000,
        arcLength: 0.9,
        rings: 1,
        maxRings: 3,
        initialPosition: { lat: 22.3193, lng: 114.1694 },
        autoRotate: true,
        autoRotateSpeed: 0.5,
      };
      
      const sampleArcs = [
        { order: 1, startLat: 24.8607, startLng: 67.0011, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.2, color: "#a855f7" },
        { order: 2, startLat: 24.8607, startLng: 67.0011, endLat: 37.7749, endLng: -122.4194, arcAlt: 0.5, color: "#c084fc" },
        { order: 3, startLat: 37.7749, startLng: -122.4194, endLat: 51.5074, endLng: -0.1278, arcAlt: 0.3, color: "#9333ea" }
      ];

      return (
        <div className="w-full h-full relative flex items-center justify-center">
          <div className="absolute w-[500px] h-[500px] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none z-0" />
          <div className="w-full h-full relative z-10">
            <World data={sampleArcs} globeConfig={globeConfig} />
          </div>
        </div>
      );
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center text-neutral-600 font-mono text-xs tracking-widest">
        INITIALIZING_GITHUB_VECTOR_GLOBE...
      </div>
    ),
  }
);

export default function SolutionPage() {
  const params = useParams();
  const slug = params.slug as string;
  const data = getSolutionData(slug);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <p className="font-mono text-neutral-500">Solution not found.</p>
      </div>
    );
  }

  useGSAP(
    () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;
      
      const tl = gsap.timeline();
      tl.from(".solution-nav", { y: -50, opacity: 0, duration: 1, ease: "power3.out" })
        .from(".solution-hero-title .line", {
          y: 100,
          opacity: 0,
          rotateX: -90,
          stagger: 0.1,
          duration: 1.2,
          ease: "back.out(1.7)",
        }, "-=0.6")
        .from(".solution-meta", { x: -30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.8")
        .from(".solution-desc", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.5")
        .from(".solution-globe-wrapper", {
          scale: 0.8,
          opacity: 0,
          duration: 1.5,
          ease: "power4.out"
        }, "-=0.8")
        .from(".stat-card", {
          y: 40,
          opacity: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
        }, "-=0.6")
        .from(".feature-row", {
          x: -20,
          opacity: 0,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
        }, "-=0.4")
        .from(".solution-cta-btn", {
          y: 30,
          opacity: 0,
          scale: 0.9,
          duration: 0.8,
          ease: "elastic.out(1, 0.5)",
        }, "-=0.3");
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <Cursor />
      <CanvasBackground />
      <SolutionScene config={data.threeDConfig} />
      <div className="solution-nav sticky top-0 z-50">
        <Navbar />
      </div>
      <main className="relative z-10">
        <section className="min-h-screen flex flex-col justify-end px-6 md:px-16 pb-20 md:pb-32 pt-32">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
              <div className="flex flex-col lg:col-span-7 justify-center">
                <div className="solution-meta flex items-center gap-4 mb-6">
                  <span
                    className="text-xs font-mono tracking-[0.25em] uppercase px-3 py-1 border rounded-full"
                    style={{ color: data.threeDConfig.color, borderColor: data.threeDConfig.color }}
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
              
              {/* Aceternity GitHub Globe Canvas Layout - Hidden on mobile */}
              <div className="solution-globe-wrapper hidden lg:block lg:col-span-5 h-[600px] w-full relative">
                <DynamicGlobeViewport />
              </div>
            </div>
          </div>
        </section>

        {/* DETAILS GRID */}
        <section className="min-h-screen bg-[#050505] relative px-6 md:px-16 py-32 rounded-t-3xl border-t border-neutral-900 z-20">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <div className="flex flex-col gap-0 opacity-100">
              <span
                className="text-xs font-mono tracking-[0.25em] uppercase mb-8 block"
                style={{ color: data.threeDConfig.color }}
              >
                Capabilities & Tech
              </span>
              <div className="flex flex-col">
                {data.features.map((feature, i) => (
                  <div data-cursor="-exclusion" key={i} className="feature-row group flex items-center justify-between py-5 border-b border-neutral-800 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono text-neutral-600">0{i + 1}</span>
                      <h3 className="text-xl md:text-2xl font-normal text-white transition-colors duration-300 group-hover:text-[var(--hover-color)]"
                        style={{ "--hover-color": data.threeDConfig.color } as React.CSSProperties}>
                        {feature}
                      </h3>
                    </div>
                    <svg
                      className="w-5 h-5 text-neutral-700 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--hover-color)]"
                      style={{ "--hover-color": data.threeDConfig.color } as React.CSSProperties}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex flex-col justify-center">
              <div className="p-8 md:p-12 rounded-3xl border border-neutral-800 bg-[#0c0c0c] backdrop-blur-sm">
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
                      style={{ "--hover-color": data.threeDConfig.color } as React.CSSProperties}
                    />
                    <span className="relative z-10 group-hover:text-white transition-colors">{data.ctaText}</span>
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
                <a data-cursor="-exclusion" href="/" className="text-xs font-mono text-neutral-500 hover:text-white transition-colors flex items-center gap-2">
                  Back to Home <span>↑</span>
                </a>
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