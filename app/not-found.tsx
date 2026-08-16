// app/not-found.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import CanvasBackground from "@/components/canvas-background";
import Cursor from "@/components/MouseFollower";
import WhatsAppButton from "@/components/whatsapp-button";

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.from(".error-code", {
        y: 100,
        opacity: 0,
        rotateX: -90,
        duration: 1.2,
        ease: "back.out(1.7)",
      })
        .from(
          ".error-message",
          {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.6"
        )
        .from(
          ".error-desc",
          {
            y: 30,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.4"
        )
        .from(
          ".home-link",
          {
            scale: 0.8,
            opacity: 0,
            duration: 0.6,
            ease: "back.out(1)",
          },
          "-=0.3"
        );
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <>
      <Cursor />
      <CanvasBackground />
      <WhatsAppButton phoneNumber="+92 334 9251936" />
      <div
        ref={containerRef}
        className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 text-center overflow-hidden"
      >
        {/* Subtle glow behind the 404 */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none z-0" />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Large 404 Text */}
          <h1
            ref={headingRef}
            className="error-code text-[15vw] md:text-[12rem] font-black tracking-tighter leading-none bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent"
          >
            404
          </h1>

          {/* Message */}
          <h2 className="error-message mt-6 text-2xl md:text-4xl font-light tracking-tight text-white">
            Lost in the void?
          </h2>
          <p className="error-desc mt-4 text-neutral-400 text-sm md:text-base max-w-md mx-auto font-light">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          {/* Back to Home Button */}
          <Link
            href="/"
            data-cursor="-exclusion"
            className="home-link group inline-flex items-center gap-3 mt-10 px-8 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-white text-sm font-medium tracking-wide hover:bg-purple-600/20 hover:border-purple-500/50 transition-all duration-300"
          >
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Optional decorative line */}
        <div className="absolute bottom-8 left-0 right-0 text-center text-[10px] font-mono text-neutral-600 tracking-widest uppercase">
          // INNOVELOUS // SYSTEM ROUTE // NOT FOUND //
        </div>
      </div>
    </>
  );
}