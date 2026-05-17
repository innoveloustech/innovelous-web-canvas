"use client";
import { useLayoutEffect, useRef, useState, useEffect } from "react";
import gsap from "gsap";

export default function Loader() {
  const scope = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLHeadingElement | null>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [shouldRender, setShouldRender] = useState(true);
  const [progress, setProgress] = useState(0);
  const hasMountedRef = useRef(false);

  // Smooth parallax tracking
  const parallaxRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useLayoutEffect(() => {
    let animationFrame: number;
    const interpolateParallax = () => {
      // Smooth interpolation for fluid cursor weight
      parallaxRef.current.x +=
        (parallaxRef.current.targetX - parallaxRef.current.x) * 0.08;
      parallaxRef.current.y +=
        (parallaxRef.current.targetY - parallaxRef.current.y) * 0.08;
      // Sub-pixel parallax on the main text heading
      if (textRef.current) {
        gsap.set(textRef.current, {
          x: parallaxRef.current.x * 6,
          y: parallaxRef.current.y * 6,
          force3D: true,
        });
      }
      // Subtle dynamic depth for split column panels
      panelsRef.current.forEach((panel, index) => {
        if (panel) {
          const depth = (index - 2.5) * 0.3;
          gsap.set(panel, {
            x: parallaxRef.current.x * depth * 3,
            y: parallaxRef.current.y * depth * 3,
            force3D: true,
          });
        }
      });
      animationFrame = requestAnimationFrame(interpolateParallax);
    };
    interpolateParallax();
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Monitor mouse positioning relative to frame center
  useEffect(() => {
    const handleMove = (x: number, y: number) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      parallaxRef.current.targetX = (x - centerX) / centerX;
      parallaxRef.current.targetY = (y - centerY) / centerY;
    };
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // Drive progressive percentage state smoothly via GSAP
  useLayoutEffect(() => {
    if (!shouldRender) return;
    const counterCtx = gsap.context(() => {
      gsap.to(
        { val: 0 },
        {
          val: 100,
          duration: 2.2,
          ease: "power2.inOut",
          onUpdate: function () {
            setProgress(Math.floor(this.targets()[0].val));
          },
        },
      );
    }, scope);
    return () => counterCtx.revert();
  }, [shouldRender]);

  // Handle core loader reveal exits
  useLayoutEffect(() => {
    if (hasMountedRef.current) {
      setShouldRender(false);
      return;
    }
    hasMountedRef.current = true;
    const body = document.body;
    body.classList.add("no-scroll");
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Signal to Home page that loading is complete
          window.dispatchEvent(new Event("loader-done"));
          gsap.to(scope.current, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
              body.classList.remove("no-scroll");
              setShouldRender(false);
              import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
                ScrollTrigger.refresh();
              });
            },
          });
        },
      });
      tl.fromTo(
        textRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power4.out" },
      )
        .to([textRef.current, ".loader-footer"], {
          opacity: 0,
          y: -20,
          duration: 0.4,
          stagger: 0.05,
          delay: 0.8,
        })
        .to(
          ".loader-panel",
          {
            scaleY: 0,
            duration: 1,
            stagger: { amount: 0.2, from: "end" },
            ease: "expo.inOut",
            transformOrigin: "top",
          },
          "-=0.2",
        );
    }, scope);
    return () => {
      ctx.revert();
      body.classList.remove("no-scroll");
    };
  }, []);

  if (!shouldRender) return null;
  return (
    <div
      ref={scope}
      className="fixed inset-0 z-[9999] w-full h-full overflow-hidden bg-black select-none"
    >
      {/* Background Columns: Deep premium charcoal layout */}
      <div className="absolute inset-0 flex w-full h-full overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) panelsRef.current[i] = el;
            }}
            className="loader-panel relative h-full flex-1 bg-[#0D0D0D] will-change-transform"
            style={{
              width: "calc(100% / 6 + 1px)",
              marginLeft: "-0.5px",
              borderRight: "1px solid rgba(255,255,255,0.015)",
            }}
          />
        ))}
      </div>
      {/* Structured Minimal Layout */}
      <div className="relative z-10 flex flex-col h-full w-full justify-between p-6 md:p-10">
        {/* Top spacing element to balance center alignment */}
        <div className="w-full h-4" />
        {/* Central Bold Brand Typography */}
        <div className="flex h-auto w-full items-center justify-center overflow-hidden">
          <div className="overflow-hidden text-center px-4">
            <h1
              ref={textRef}
              className="text-[#A855F7] text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase will-change-transform"
              style={{
                fontStyle: "italic",
                letterSpacing: "-0.05em",
                textShadow: "0 0 40px rgba(168, 85, 247, 0.12)",
              }}
            >
              Innovelous Tech
            </h1>
          </div>
        </div>
        {/* Bottom Minimal Progress Track */}
        <div className="loader-footer flex flex-col items-center gap-2 w-full max-w-xs mx-auto mb-4">
          <div className="w-full h-[1px] bg-zinc-900 relative overflow-hidden">
            <div
              className="h-full bg-[#A855F7] transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between w-full font-mono text-[10px] tracking-wider text-zinc-500">
            <span>LOADING</span>
            <span className="text-zinc-300 font-bold tabular-nums">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}