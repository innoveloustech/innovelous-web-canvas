"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/components/navbar";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "13+", label: "Years of Expertise" },
  { value: "1000+", label: "Clients Worldwide" },
  { value: "2000+", label: "Successful Projects" },
];

const marqueeWords = [
  "Communication",
  "·",
  "Technology",
  "·",
  "Innovation",
  "·",
  "Excellence",
  "·",
  "Solutions",
  "·",
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      // 1. Text Reveal Animation for the Hero Title
      // Wraps characters or words to animate cleanly from clipping masks
      gsap.from(".hero-word-inner", {
        y: "110%",
        duration: 1.4,
        ease: "power4.out",
        delay: 0.2,
      });

      // 2. Subtle Opacity Reveals for Contextual Typography
      gsap.from(".hero-tag, .hero-sub, .stat-item", {
        opacity: 0,
        y: 20,
        duration: 1,
        stagger: 0.05,
        ease: "power3.out",
      });

      // 3. Smooth Page Skew on Fast Scroll Velocity
      let proxy = { skew: 0 },
        skewSetter = gsap.quickSetter(containerRef.current, "skewY", "deg"),
        clamp = gsap.utils.clamp(-4, 4); // Don't distort too violently

      ScrollTrigger.create({
        onUpdate: (self) => {
          let skew = clamp(self.getVelocity() / -300);
          if (Math.abs(skew) > Math.abs(proxy.skew)) {
            proxy.skew = skew;
            gsap.to(proxy, {
              skew: 0,
              duration: 0.8,
              ease: "power3.out",
              overwrite: "auto",
              onUpdate: () => skewSetter(proxy.skew),
            });
          }
        },
      });

      // 4. Elegant Interactive Reveal for Services Row Items
      const rows = gsap.utils.toArray<HTMLElement>(".service-row");
      rows.forEach((row) => {
        const revealTarget = row.querySelector(".service-reveal");
        const internalText = row.querySelector(".service-title-text");

        row.addEventListener("mouseenter", () => {
          gsap.to(revealTarget, {
            width: "auto",
            opacity: 1,
            x: 10,
            duration: 0.4,
            ease: "power2.out",
          });
          gsap.to(internalText, { x: 15, color: "#a855f7", duration: 0.3 });
        });

        row.addEventListener("mouseleave", () => {
          gsap.to(revealTarget, {
            width: 0,
            opacity: 0,
            x: 0,
            duration: 0.3,
            ease: "power2.in",
          });
          gsap.to(internalText, { x: 0, color: "#ffffff", duration: 0.3 });
        });
      });

      // 5. Magnetic CTA Button Logic
      const cta = ctaRef.current;
      if (cta) {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = cta.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;

          gsap.to(cta, {
            x: x * 0.4, // Pull structural intensity factor
            y: y * 0.4,
            duration: 0.3,
            ease: "power2.out",
          });
        };

        const handleMouseLeave = () => {
          gsap.to(cta, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)",
          });
        };

        cta.addEventListener("mousemove", handleMouseMove);
        cta.addEventListener("mouseleave", handleMouseLeave);
      }
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="bg-black text-white min-h-screen overflow-x-hidden origin-right"
    >
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-between px-6 md:px-16 pt-32 pb-16">
        <div className="hero-tag flex items-start justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 structural-pulse" />
            <span className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-mono">
              Available Worldwide
            </span>
          </div>
          <div className="text-right text-xs uppercase tracking-[0.15em] text-neutral-400 font-mono">
            [ Next-Gen Architecture ]
          </div>
        </div>

        {/* Masked Over-sized Typography Block */}
        <div className="w-full my-auto py-12">
          <div className="overflow-hidden py-2">
            <h1
              className="hero-word block font-black leading-[0.85] tracking-tighter text-left select-none uppercase text-white"
              style={{ fontSize: "clamp(3.5rem, 15vw, 14rem)" }}
            >
              <span className="hero-word-inner block">innovelous</span>
            </h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-12 w-full">
          <div className="flex flex-col gap-8 max-w-sm">
            <p className="hero-sub text-neutral-400 text-sm md:text-base leading-relaxed tracking-wide">
              We engineer high-throughput digital communication ecosystems and
              custom interactive interfaces for modern platforms.
            </p>

            {/* Magnetic Interaction Button */}
            <button
              ref={ctaRef}
              className="hero-cta group flex items-center gap-4 bg-neutral-900 border border-neutral-800 px-6 py-4 rounded-full w-fit hover:bg-white transition-colors duration-500"
            >
              <span className="text-white group-hover:text-black text-xs uppercase tracking-widest font-mono font-bold transition-colors duration-500">
                Explore Index
              </span>
              <div className="w-2 h-2 rounded-full bg-purple-500 group-hover:bg-black transition-colors duration-500" />
            </button>
          </div>

          {/* Clean Numerical Metric Grid */}
          <div className="flex gap-12 border-t border-neutral-900 pt-6 w-full md:w-auto justify-between md:justify-end">
            {stats.map((s, i) => (
              <div key={i} className="stat-item flex flex-col gap-1">
                <span className="text-2xl md:text-4xl font-light tracking-tight text-white">
                  {s.value}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE RUNWAY */}
      <div className="relative overflow-hidden py-6 border-y border-neutral-900 bg-neutral-950/20">
        <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite]">
          {[...marqueeWords, ...marqueeWords, ...marqueeWords].map(
            (word, i) => (
              <span
                key={i}
                className={`inline-block px-6 text-xs font-mono tracking-[0.25em] uppercase ${
                  word === "·"
                    ? "text-purple-500 font-bold"
                    : "text-neutral-600"
                }`}
              >
                {word}
              </span>
            ),
          )}
        </div>
      </div>

      {/* HIGH END INTERACTIVE SERVICES SECTION */}
      <section className="px-6 md:px-16 py-32 max-w-7xl mx-auto">
        <div className="mb-20">
          <span className="text-purple-500 text-xs font-mono tracking-[0.3em] uppercase block mb-3">
            01 // CAPABILITIES
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight text-white">
            Selected Digital Disciplines
          </h2>
        </div>

        {/* Structural Rows replacing the card grid */}
        <div className="flex flex-col border-t border-neutral-800">
          {services.map((s, i) => (
            <div
              key={i}
              className="service-row group flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-neutral-800 cursor-pointer transition-all duration-300 unique-row-layout"
            >
              <div className="flex items-center gap-6 mb-4 md:mb-0">
                <span className="text-xs font-mono text-neutral-600">
                  0{i + 1}
                </span>
                <h3 className="service-title-text text-xl md:text-2xl font-normal text-white transition-transform duration-300 ease-out">
                  {s.title}
                </h3>
              </div>

              <div className="flex items-center gap-8 justify-between md:justify-end md:w-1/2">
                <p className="text-sm text-neutral-500 max-w-xs md:text-right font-light">
                  {s.desc}
                </p>
                {/* Dynamic animated arrow element */}
                <div className="service-reveal opacity-0 w-0 overflow-hidden flex items-center text-purple-500 hidden md:flex">
                  <svg
                    className="w-5 h-5 transform -rotate-45"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .structural-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
}

const services = [
  {
    title: "Corporate SMS Messaging",
    desc: "High-throughput bulk infrastructure tailored for explicit transactional utility.",
  },
  {
    title: "Location-Based Telemetry",
    desc: "Precision geo-targeted dispatch mechanics routing spatial-dependent actions.",
  },
  {
    title: "Short-Code Operations",
    desc: "Dedicated programmatic system anchors managing two-way customer communication loopbacks.",
  },
  {
    title: "Automated Voice Architecture",
    desc: "IVR matrix configurations and automated micro-broadcast instances deployed at scale.",
  },
  {
    title: "Next-Gen Web Platforms",
    desc: "High-performance full-stack interfaces designed to eliminate interaction friction.",
  },
];
