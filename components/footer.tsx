"use client";

import React, { useEffect, useState } from "react";

export default function Footer() {
  const [systemTime, setSystemTime] = useState("");
  const [greeting, setGreeting] = useState("CORE STATUS // ONLINE");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );

      const hrs = now.getHours();
      if (hrs < 12) setGreeting("CORE MATRIX // GOOD MORNING");
      else if (hrs < 18) setGreeting("CORE MATRIX // GOOD AFTERNOON");
      else setGreeting("CORE MATRIX // GOOD EVENING");
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full h-full bg-neutral-950 text-neutral-400 font-sans select-none px-8 md:px-20 py-16 flex flex-col justify-between border-b border-neutral-900 selection:bg-purple-500/20">
      
      {/* Top Deck: Big Brand Typography & Live Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-neutral-900 pb-12">
        <div className="flex items-baseline gap-4">
          <h1 className="text-white text-6xl md:text-9xl font-black tracking-tighter uppercase">
            INNOVELOUS
          </h1>
          <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1 rounded border border-neutral-800 font-mono">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-emerald-400 tracking-widest font-bold">SYS_ACTIVE</span>
          </div>
        </div>
        
        <p className="text-sm md:text-base text-neutral-500 font-mono max-w-sm text-left md:text-right leading-relaxed">
          Eliminating system friction through cutting-edge interactive architectures and real-time digital experiences.
        </p>
      </div>

      {/* Middle Deck: Expanded Navigation & Diagnostic Node Panels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 my-auto py-8">
        
        {/* Column 1: Core Navigation */}
        <div className="flex flex-col space-y-5">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-600 font-bold">
            // INDEX DIRECTIONS
          </span>
          <ul className="space-y-4 text-xl md:text-2xl font-bold text-neutral-300">
            {["Home Base", "Telemetry Core", "Services Cluster", "Contact Deck"].map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="hover:text-white transition-colors duration-200 relative group inline-block"
                >
                  {item}
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-purple-500 transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2: External Node Networks */}
        <div className="flex flex-col space-y-5">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-600 font-bold">
            // NETWORK COORDINATES
          </span>
          <ul className="space-y-4 text-xl md:text-2xl font-bold text-neutral-300">
            {[
              { label: "GitHub Profile", link: "#" },
              { label: "X / Twitter", link: "#" },
              { label: "LinkedIn Connect", link: "#" },
              { label: "Discord Station", link: "#" },
            ].map((node) => (
              <li key={node.label}>
                <a
                  href={node.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors duration-200 relative group inline-block"
                >
                  {node.label}
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-purple-500 transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Architecture Protocols */}
        <div className="flex flex-col space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-600 font-bold">
            // TECHNICAL MATRIX
          </span>
          <div className="text-sm md:text-base font-mono text-neutral-500 space-y-3 max-w-xs">
            <p>FRAMEWORK: NEXT.js (ACTORS ENGINE)</p>
            <p>GRAPHICS LAYER: THREE.js + CANVAS MATRIX</p>
            <p>ANIMATION INTERACTION: GSAP SCROLLTRIGGER</p>
            <p>STYLING AGENT: TAILWIND CSS v4</p>
          </div>
        </div>

        {/* Column 4: Live Environment Telemetry */}
        <div className="flex flex-col space-y-4 font-mono bg-neutral-900/30 p-6 rounded-xl border border-neutral-900/60 backdrop-blur-sm">
          <span className="text-xs uppercase tracking-widest text-purple-400 font-bold">
            {greeting}
          </span>
          <div className="space-y-2.5 text-xs md:text-sm text-neutral-500">
            <div className="flex justify-between border-b border-neutral-900/40 pb-1.5">
              <span>LOCAL_TIME:</span>
              <span className="text-neutral-300 font-bold tracking-normal">{systemTime || "00:00:00"}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-900/40 pb-1.5">
              <span>NODE_ENV:</span>
              <span className="text-neutral-300">PRODUCTION</span>
            </div>
            <div className="flex justify-between">
              <span>DEPLOY_LOC:</span>
              <span className="text-neutral-300">KARACHI / REGION_S</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Deck: Legal & Compliance Anchors */}
      <div className="border-t border-neutral-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-neutral-600">
        <div>
          &copy; {new Date().getFullYear()} INNOVELOUS INTEL. ALL PERMISSIONS ENFORCED.
        </div>
        <div className="flex space-x-8">
          <a href="#" className="hover:text-neutral-400 transition-colors tracking-tight">PRIVACY_STRUCT</a>
          <a href="#" className="hover:text-neutral-400 transition-colors tracking-tight">TERMS_MATRICES</a>
        </div>
      </div>

    </footer>
  );
}