"use client";
import { useRef, useEffect, useCallback } from "react";

const marqueeWords = ["Communication", "·", "Technology", "·", "Innovation", "·", "Excellence", "·", "Solutions", "·"];

export default function DraggableMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const xRef = useRef(0);
  const velRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const BASE_SPEED = 0.6; // px per frame auto-scroll

  // Render 3 copies so we always have content to snap against
  const words = [...marqueeWords, ...marqueeWords, ...marqueeWords];

  const getTrackWidth = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    // Width of one full set of marqueeWords (1/3 of total since we have 3 copies)
    return track.scrollWidth / 3;
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const tick = () => {
      const unit = getTrackWidth();
      if (unit === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!isDraggingRef.current) {
        // Auto-scroll + decelerate residual drag velocity
        velRef.current = velRef.current * 0.92; // friction
        xRef.current -= BASE_SPEED + Math.abs(velRef.current) * Math.sign(velRef.current) * 0.1;
      }

      // Infinite loop: snap back by one unit when we've scrolled one full copy
      if (xRef.current <= -unit) xRef.current += unit;
      if (xRef.current > 0) xRef.current -= unit;

      track.style.transform = `translateX(${xRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [getTrackWidth]);

  // Pointer events for drag (Handles both mouse clicks and touch indicators natively)
  const onPointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velRef.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dt = Math.max(now - lastTimeRef.current, 1);
    const dx = e.clientX - lastXRef.current;
    
    // Prevent sudden excessive velocity jumps on small mobile drag ticks
    const targetVel = (dx / dt) * 16;
    velRef.current = Math.min(Math.max(targetVel, -30), 30); 

    xRef.current += dx;
    lastXRef.current = e.clientX;
    lastTimeRef.current = now;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // Avoid crash blocks if DOM pointer states unmounted early during quick touch interactions
      }
    }
  };

  return (
    <div
      className="relative overflow-hidden py-4 md:py-5 border-y border-neutral-900 bg-neutral-950/20 select-none"
      style={{ 
        cursor: "grab",
        // CRITICAL MOBILE FIX: Tells the browser to handle vertical scrolling (pan-y) 
        // natively over this area, but hands horizontal dragging directly to our JS pointer code.
        touchAction: "pan-y" 
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      data-cursor-text="Drag"
    >
      {/* Edge fade masks - Shrunk on mobile viewports for compact screen visibility */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-24 z-10"
        style={{ background: "linear-gradient(to right, rgb(10,10,10), transparent)" }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-24 z-10"
        style={{ background: "linear-gradient(to left, rgb(10,10,10), transparent)" }} />

      <div
        ref={trackRef}
        className="flex whitespace-nowrap will-change-transform"
        style={{ width: "max-content" }}
      >
        {words.map((word, i) => (
          <span
            key={i}
            className={`inline-block px-3 md:px-6 text-[10px] md:text-xs font-mono tracking-[0.2em] md:tracking-[0.25em] uppercase ${
              word === "·" ? "text-purple-500 font-bold" : "text-neutral-600"
            }`}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}