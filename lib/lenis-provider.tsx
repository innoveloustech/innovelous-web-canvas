"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import Lenis from "lenis";
import type { LenisOptions } from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register the plugin globally
gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);

export function LenisProvider({
  children,
  options = {},
}: {
  children: React.ReactNode;
  options?: LenisOptions;
}) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const lenisInstance = new Lenis({
      // REMOVED autoRaf: true because we are syncing manually with gsap.ticker
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
      anchors: true,
      syncTouch: false, 
      ...optionsRef.current,
    });

    // 1. Tell ScrollTrigger to update every time Lenis scrolls
    lenisInstance.on("scroll", ScrollTrigger.update);

    // 2. Create a named RAF callback to sync Lenis with GSAP's ticker
    const rafCallback = (time: number) => {
      lenisInstance.raf(time * 1000);
    };

    gsap.ticker.add(rafCallback);
    
    // 3. Disable lag smoothing to prevent scroll jitter
    gsap.ticker.lagSmoothing(0);

    setLenis(lenisInstance);

    return () => {
      lenisInstance.destroy();
      gsap.ticker.remove(rafCallback); // Clean up the ticker listener
      setLenis(null);
    };
  }, []); 

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}

export function useLenis() {
  const context = useContext(LenisContext);
  if (context === undefined) {
    throw new Error("useLenis must be used within a LenisProvider");
  }
  return context;
}