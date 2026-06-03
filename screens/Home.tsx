"use client";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/navbar";
import Cursor from "@/components/MouseFollower";
import ContactSection from "@/components/ContactSection";
import FAQ from "@/components/FAQ";
import DraggableMarquee from "@/components/home/DraggableMarquee";
import CubeSection from "@/components/cubesection";

const CanvasBackground = dynamic(() => import("@/components/canvas-background"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "13+", label: "Years of Expertise" },
  { value: "1000+", label: "Clients Worldwide" },
  { value: "2000+", label: "Successful Projects" },
];

const services = [
  { title: "Custom Projects & MVPs", desc: "End-to-end engineering built from the ground up, from rapid MVP launches to complex architectures tailored to your exact business needs." },
  { title: "Ready-made Solutions", desc: "Pre-validated, high-performance modules designed for rapid integration and immediate scalability." },
  { title: "Web App Engineering", desc: "Next-generation full-stack applications engineered for speed, security, and seamless interaction." },
  { title: "Project Consultancy", desc: "Strategic technical guidance to optimize development lifecycles and maximize engineering velocity." },
  { title: "UI/UX Design", desc: "Immersive, human-centric interface architecture that drives engagement and simplifies complex workflows." },
  { title: "Design Systems & Prototyping", desc: "Unified component libraries and interactive blueprints to standardize and accelerate production." },
];

const HERO_WORD = "innovelous".split("");

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const skewContentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const serviceRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  useGSAP(
    () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      gsap.from(".hero-char", {
        y: "115%", opacity: 0, rotateX: -90, duration: 1.5,
        stagger: { amount: 1.1, ease: "power3.inOut", from: "start" },
        ease: "back.out(1.6)",
      });
      gsap.from(".hero-tag, .hero-sub, .stat-item", {
        opacity: 0, y: 30, duration: 1, stagger: 0.12, ease: "power3.out", delay: 0.35,
      });

      // Page Skew on Scroll
      const proxy = { skew: 0 };
      const skewSetter = gsap.quickSetter(skewContentRef.current, "skewY", "deg");
      const clamp = gsap.utils.clamp(-4, 4);
      
      ScrollTrigger.create({
        onUpdate: (self) => {
          const skew = clamp(self.getVelocity() / -300);
          if (Math.abs(skew) > Math.abs(proxy.skew)) {
            proxy.skew = skew;
            gsap.to(proxy, {
              skew: 0, duration: 0.8, ease: "power3.out", overwrite: "auto",
              onUpdate: () => skewSetter(proxy.skew),
            });
          }
        },
      });

      // Services Hover Interactions
      gsap.utils.toArray<HTMLElement>(".service-row").forEach((row) => {
        const revealTarget = row.querySelector(".service-reveal");
        const internalText = row.querySelector(".service-title-text");
        
        row.addEventListener("mouseenter", () => {
          gsap.to(revealTarget, { width: "auto", opacity: 1, x: 10, duration: 0.4, ease: "power2.out" });
          gsap.to(internalText, { x: 15, color: "#a855f7", duration: 0.3 });
        });
        row.addEventListener("mouseleave", () => {
          gsap.to(revealTarget, { width: 0, opacity: 0, x: 0, duration: 0.3, ease: "power2.in" });
          gsap.to(internalText, { x: 0, color: "#ffffff", duration: 0.3 });
        });
      });

      // Magnetic CTA
      const cta = ctaRef.current;
      if (cta) {
        const move = (e: MouseEvent) => {
          const rect = cta.getBoundingClientRect();
          gsap.to(cta, {
            x: (e.clientX - rect.left - rect.width / 2) * 0.4,
            y: (e.clientY - rect.top - rect.height / 2) * 0.4,
            duration: 0.3, ease: "power2.out",
          });
        };
        const leave = () => gsap.to(cta, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        cta.addEventListener("mousemove", move);
        cta.addEventListener("mouseleave", leave);
      }

      // Hero Title Parallax
      const heroWrapper = containerRef.current?.querySelector(".hero-title-wrapper");
      if (heroWrapper) {
        const move = (e: MouseEvent) => {
          const x = e.clientX / window.innerWidth - 0.5;
          const y = e.clientY / window.innerHeight - 0.5;
          gsap.to(heroWrapper, {
            x: x * 25, y: y * 12, rotateX: -y * 8, rotateY: x * 12,
            duration: 0.8, ease: "power2.out",
          });
        };
        const leave = () => gsap.to(heroWrapper, { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: 1, ease: "power3.out" });
        window.addEventListener("mousemove", move);
        containerRef.current?.addEventListener("mouseleave", leave);
      }

      // Services Pinning
      ScrollTrigger.create({
        trigger: serviceRef.current, start: "top top", end: "+=100%",
        pin: true, pinSpacing: false, pinType: "transform",
      });

      gsap.from(".about-label", { scrollTrigger: { trigger: "#about", start: "top 75%" }, y: 20, opacity: 0, duration: 0.8, ease: "power3.out" });
      gsap.from(".about-title", { scrollTrigger: { trigger: "#about", start: "top 72%" }, y: 40, opacity: 0, duration: 1, ease: "power3.out", delay: 0.1 });
      gsap.from(".about-desc", { scrollTrigger: { trigger: "#about", start: "top 68%" }, y: 30, opacity: 0, stagger: 0.15, duration: 0.9, ease: "power3.out", delay: 0.2 });
      gsap.from(".about-stat", { scrollTrigger: { trigger: "#about", start: "top 65%" }, y: 25, opacity: 0, stagger: 0.12, duration: 0.8, ease: "power3.out", delay: 0.3 });
      gsap.from(".about-divider", { scrollTrigger: { trigger: "#about", start: "top 70%" }, scaleX: 0, duration: 1.2, ease: "power3.inOut", delay: 0.15 });
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <>
      <Cursor />
      <div ref={containerRef} className="text-white min-h-screen overflow-x-hidden relative bg-transparent">
        <CanvasBackground />
        <Navbar />
        <div ref={skewContentRef} className="origin-right w-full home-skew-wrapper">
          {/* HERO SECTION */}
          <section className="relative min-h-screen flex flex-col justify-between px-6 md:px-16 pt-32 pb-16 bg-transparent">
            <div className="hero-tag flex items-start justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 structural-pulse" />
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-mono">Available Worldwide</span>
              </div>
              <div className="text-right text-xs uppercase tracking-[0.15em] text-neutral-400 font-mono">[ Next-Gen Architecture ]</div>
            </div>

            <div className="hero-title-wrapper w-full my-auto py-16 select-none overflow-hidden" style={{ perspective: 1200 }}>
              <div className="w-full max-w-full overflow-hidden py-4 flex items-center justify-center">
                <h1
                  className="hero-word block font-black leading-[0.85] tracking-[-0.03em] text-center uppercase text-white break-none"
                  style={{ fontSize: "clamp(3.5rem, 11.5vw, 10rem)" }}
                  data-cursor-text=" "
                >
                  <div className="flex items-center justify-center overflow-hidden">
                    {HERO_WORD.map((char, i) => (
                      <span key={i} className="hero-char-wrapper inline-block overflow-hidden">
                        <span
                          className="hero-char inline-block"
                          style={{ transformOrigin: "bottom center", willChange: "transform, opacity" }}
                        >
                          {char}
                        </span>
                      </span>
                    ))}
                  </div>
                </h1>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12 w-full">
              <div className="flex flex-col gap-8 max-w-sm">
                <p className="hero-sub text-neutral-400 text-sm md:text-base leading-relaxed tracking-wide">
                  We engineer custom software, AI integrations, and scalable web ecosystems that bridge complex technology with seamless human experience.
                </p>
                <button
                  ref={ctaRef}
                  data-cursor-pointer
                  className="hero-cta group flex items-center gap-4 bg-neutral-900 border border-neutral-800 px-6 py-4 rounded-full w-fit hover:bg-white transition-colors duration-500"
                >
                  <span className="text-white group-hover:text-black text-xs uppercase tracking-widest font-mono font-bold transition-colors duration-500">Explore Our Projects</span>
                  <div className="w-2 h-2 rounded-full bg-purple-500 group-hover:bg-black transition-colors duration-500" />
                </button>
              </div>

              <div className="flex gap-12 border-t border-neutral-900 pt-6 w-full md:w-auto justify-between md:justify-end">
                {stats.map((s, i) => (
                  <div key={i} className="stat-item flex flex-col gap-1">
                    <span className="text-2xl md:text-4xl font-light tracking-tight text-white">{s.value}</span>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── PROFESSIONAL DRAGGABLE MARQUEE ── */}
          <DraggableMarquee />

          {/* SERVICES SECTION */}
          <section ref={serviceRef} id="service" className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-20 relative z-10">
            <div className="max-w-7xl mx-auto w-full">
              <div className="mb-8">
                <span className="text-purple-500 text-xs font-mono tracking-[0.3em] uppercase block mb-2">01 // CAPABILITIES</span>
                <h2 className="text-3xl md:text-5xl font-light tracking-tight text-white">Selected Digital Disciplines</h2>
              </div>
              <div className="flex flex-col border-t border-neutral-800">
                {services.map((s, i) => (
                  <div
                    data-cursor-text="Click"
                    key={i}
                    data-cursor-pointer
                    className="service-row group flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-neutral-800 cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 md:gap-6 mb-2 md:mb-0">
                      <span className="text-xs font-mono text-neutral-600">0{i + 1}</span>
                      <h3 className="service-title-text text-lg md:text-xl font-normal text-white transition-transform duration-300 ease-out">{s.title}</h3>
                    </div>
                    <div className="flex items-center gap-6 justify-between md:justify-end md:w-1/2">
                      <p className="text-sm text-neutral-500 max-w-xs md:text-right font-light">{s.desc}</p>
                      <div className="service-reveal opacity-0 w-0 overflow-hidden flex items-center text-purple-500 hidden md:flex">
                        <svg className="w-5 h-5 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ABOUT US SECTION */}
          <section id="about" className="min-h-screen bg-zinc-950 relative z-20 px-6 md:px-16 flex items-center rounded-t-3xl">
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 py-24">
              <div className="about-text-col flex flex-col justify-center">
                <h2 className="about-title text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-white mb-8 leading-[1.1]">
                  Bridging Technology <br /> & Human Experience
                </h2>
                <div className="space-y-6 text-neutral-400 text-base md:text-lg leading-relaxed font-light">
                  <p className="about-desc">At Innovelous, we don't just build software—we architect communication ecosystems. Our foundation is rooted in precision engineering, real-time telemetry, and adaptive interface design.</p>
                  <p className="about-desc">From enterprise-grade messaging infrastructure to next-generation web platforms, we translate complex technical requirements into seamless, human-centric digital experiences.</p>
                </div>
                <div className="mt-10 flex items-center gap-6">
                  <div className="w-12 h-[1px] bg-purple-500/50"></div>
                  <span className="text-xs uppercase tracking-[0.2em] text-purple-400 font-mono">Est. 2012</span>
                </div>
              </div>
              <div className="about-stats-col flex flex-col justify-center gap-10 border-t border-neutral-800 pt-12 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-16">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-6 about-divider" style={{ transformOrigin: "left center" }}>
                  <span className="text-sm uppercase tracking-widest text-neutral-500 font-mono">Core Philosophy</span>
                  <span className="text-xl text-white font-light">Precision First</span>
                </div>
                <div className="flex items-center justify-between border-b border-neutral-800 pb-6 about-divider" style={{ transformOrigin: "left center" }}>
                  <span className="text-sm uppercase tracking-widest text-neutral-500 font-mono">Global Reach</span>
                  <span className="text-xl text-white font-light">42+ Countries</span>
                </div>
                <div className="flex items-center justify-between about-divider" style={{ transformOrigin: "left center" }}>
                  <span className="text-sm uppercase tracking-widest text-neutral-500 font-mono">Uptime SLA</span>
                  <span className="text-xl text-white font-light">99.99%</span>
                </div>
                <div className="mt-8 about-stat p-6 bg-neutral-900/30 border border-neutral-800 rounded-2xl">
                  <p className="text-neutral-300 text-sm leading-relaxed italic">"We measure success not by lines of code, but by the seamless interactions we enable across millions of devices daily."</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    </div>
                    <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono">Engineering Lead</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <CubeSection />
          <ContactSection showCapabilities />
        </div>
      </div>
    </>
  );
}