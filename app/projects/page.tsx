"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

import Navbar from "@/components/navbar";
import Cursor from "@/components/MouseFollower";
import CanvasBackground from "@/components/canvas-background";

// ─── DUMMY PROJECTS DATA ─────────────────────────────────────────────────────
const projects = [
  {
    id: 1,
    title: "Nexus Mobile App",
    category: "Mobile Development",
    description: "A cross-platform mobile application built with React Native, featuring offline-first architecture, seamless push notification ecosystems, and fluid 60fps gesture-driven interfaces.",
    link: "https://example.com/nexus",
    color: "#f59e0b",
  },
  {
    id: 2,
    title: "Aero Web Platform",
    category: "Web Development",
    description: "Next-generation full-stack web application engineered for sub-millisecond response times, perfect Core Web Vitals, and global edge delivery for flawless user experiences.",
    link: "https://example.com/aero",
    color: "#f43f5e",
  },
  {
    id: 3,
    title: "Lumina Design System",
    category: "UI/UX Design",
    description: "Immersive, accessible, and conversion-focused design system mapping user journeys to create interfaces that are as beautiful as they are functionally robust.",
    link: "https://example.com/lumina",
    color: "#6366f1",
  },
  {
    id: 4,
    title: "Synapse AI Dashboard",
    category: "AI Integration",
    description: "Enterprise cognitive core embedding LLMs and autonomous agents directly into business logic, featuring custom RAG pipelines and real-time data processing.",
    link: "https://example.com/synapse",
    color: "#a855f7",
  },
];

// ─── 3D MODAL GEOMETRY COMPONENT ─────────────────────────────────────────────
function ModalGeometry({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Memoize geometry to prevent recreation on renders
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.5, 1), []);

  // Animate color transition when project changes
  useEffect(() => {
    if (materialRef.current) {
      gsap.to(materialRef.current.color, {
        r: new THREE.Color(color).r,
        g: new THREE.Color(color).g,
        b: new THREE.Color(color).b,
        duration: 1,
        ease: "power2.out",
      });
    }
  }, [color]);

  // Continuous subtle rotation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          metalness={0.8}
          roughness={0.2}
          wireframe
        />
      </mesh>
    </Float>
  );
}

// ─── MAIN PROJECTS PAGE COMPONENT ────────────────────────────────────────────
export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<(typeof projects)[0] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // 1. Page Entrance Animations
  useGSAP(() => {
    gsap.from(".project-card", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".projects-grid",
        start: "top 80%",
      },
    });
  }, { scope: containerRef });

  // 2. Modal Open Animation
  useGSAP(() => {
    if (selectedProject && modalRef.current && modalContentRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        modalContentRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" }
      );
    }
  }, { dependencies: [selectedProject] });

  // 3. Modal Close Animation
  const closeModal = () => {
    if (modalRef.current && modalContentRef.current) {
      const tl = gsap.timeline({
        onComplete: () => setSelectedProject(null),
      });
      tl.to(modalContentRef.current, { scale: 0.9, opacity: 0, y: 20, duration: 0.2, ease: "power2.in" })
        .to(modalRef.current, { opacity: 0, duration: 0.2 }, "-=0.1");
    } else {
      setSelectedProject(null);
    }
  };

  // 4. Card Hover Interactions
  const handleCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { y: -5, borderColor: "rgba(168, 85, 247, 0.5)", duration: 0.3, ease: "power2.out" });
    gsap.to(e.currentTarget.querySelector(".card-arrow"), { x: 5, duration: 0.3, ease: "power2.out" });
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { y: 0, borderColor: "rgba(255, 255, 255, 0.1)", duration: 0.3, ease: "power2.out" });
    gsap.to(e.currentTarget.querySelector(".card-arrow"), { x: 0, duration: 0.3, ease: "power2.out" });
  };

  return (
    <>
      <Cursor />
      <CanvasBackground />
      <Navbar />
      
      <main ref={containerRef} className="relative min-h-screen bg-[#0a0a0a] text-white pt-32 pb-20 px-6 md:px-16 overflow-hidden">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-20">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
            Selected <br />
            <span className="text-neutral-500">Works.</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl font-light leading-relaxed">
            A curated collection of high-performance digital products, engineered for scale and designed for impact.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="projects-grid max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              data-cursor-pointer
              onClick={() => setSelectedProject(project)}
              onMouseEnter={handleCardEnter}
              onMouseLeave={handleCardLeave}
              className="project-card group relative flex flex-col justify-between p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm cursor-pointer transition-colors duration-300 hover:bg-white/[0.04] min-h-[380px]"
            >
              {/* Arrow Icon */}
              <div className="absolute top-8 right-8 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-purple-500/50 transition-colors duration-300">
                <svg className="card-arrow w-4 h-4 text-neutral-400 group-hover:text-purple-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </div>

              {/* Content */}
              <div className="mt-16">
                <span 
                  className="text-[10px] font-mono tracking-[0.25em] uppercase px-3 py-1 border rounded-full mb-6 inline-block" 
                  style={{ color: project.color, borderColor: project.color }}
                >
                  {project.category}
                </span>
                <h3 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-4 group-hover:text-purple-400 transition-colors duration-300">
                  {project.title}
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed font-light">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ─── PROJECT DETAILS MODAL ───────────────────────────────────────────── */}
      {selectedProject && (
        <div 
          ref={modalRef}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
          onClick={closeModal}
        >
          <div 
            ref={modalContentRef}
            className="relative w-full max-w-5xl bg-[#0f0f11] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left: 3D Visual Side */}
              <div className="relative h-64 lg:h-auto min-h-[400px] bg-gradient-to-br from-black to-[#0a0a0a] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-40">
                  <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[5, 5, 5]} intensity={1.5} color={selectedProject.color} />
                    <pointLight position={[-5, -5, -5]} intensity={0.5} color="#a855f7" />
                    <ModalGeometry color={selectedProject.color} />
                  </Canvas>
                </div>
                <div className="absolute bottom-6 left-6 pointer-events-none">
                  <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-500">
                    Interactive Preview
                  </span>
                </div>
              </div>

              {/* Right: Content Side */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span 
                  className="text-[10px] font-mono tracking-[0.25em] uppercase mb-4 block" 
                  style={{ color: selectedProject.color }}
                >
                  {selectedProject.category}
                </span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-6">
                  {selectedProject.title}
                </h2>
                <p className="text-neutral-400 text-base leading-relaxed font-light mb-12">
                  {selectedProject.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="-exclusion"
                    className="group relative flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold text-sm overflow-hidden transition-transform hover:scale-105"
                  >
                    <span className="absolute inset-0 w-0 bg-purple-600 group-hover:w-full transition-all duration-500 ease-out" />
                    <span className="relative z-10 group-hover:text-white transition-colors">View Live Project</span>
                    <svg className="relative z-10 w-4 h-4 text-black group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <button
                    onClick={closeModal}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}