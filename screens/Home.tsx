"use client";
import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import Navbar from "@/components/navbar";
import Cursor from "@/components/MouseFollower";
import ContactSection from "@/components/ContactSection";
import DraggableMarquee from "@/components/home/DraggableMarquee";
import CubeSection from "@/components/cubesection";
import WhatsAppButton from "@/components/whatsapp-button";
import ImpactSection from "@/components/home/ImpactSection";
import InteractiveBentoFAQ from "@/components/home/FAQ";
import FeaturedProjectsClient from "@/components/home/FeaturedProjectsClient";
import TransitionLink from "@/components/TransitionLink";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

const CanvasBackground = dynamic(() => import("@/components/canvas-background"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: "2+", label: "Years of Expertise" },
  { value: "15+", label: "Technologies Covered" },
  { value: "50+", label: "Projects Delivered" },
];

const services = [
  { title: "Custom Software & Rapid MVPs", desc: "Scalable engineering by a top software agency. We build high-performance, rapid MVPs tailored to your business goals." },
  { title: "AI Automation Solutions", desc: "Pre-validated modules built for instant scale. Easily integrate business automation and advanced biometric systems." },
  { title: "Full-Stack Web & App Dev", desc: "Next-gen full-stack apps engineered for speed, robust security, and seamless, cloud-native performance." },
  { title: "IT Consultancy & Growth Strategy", desc: "Expert technical guidance and performance engineering. We align robust code with high-impact digital marketing" },
  { title: "UI/UX Engineering", desc: "Crafting intuitive, human-centered digital interfaces. We merge minimalist design aesthetics with flawless usability to maximize engagement, retention, and conversions." },
  { title: "Design Systems & Prototyping", desc: "Building reusable component libraries and high-fidelity interactive prototypes. We establish unified frameworks that bridge the gap between design and development." },
];

const HERO_WORDS = ["INNOVELOUS", "AI Products", "Web & Apps"];

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

// ---------------------------------------------------------------
// 3D LIQUID BEND BACKGROUND COMPONENT (No grid lines, unclipped)
// ---------------------------------------------------------------
const LiquidAboutBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const velocityRef = useRef(0);
  const smoothedVelocityRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;

    const PADDING = 160; // 160px vertical padding so bend wave doesn't get clipped on scroll up/down
    let totalWidth = container.clientWidth;
    let totalHeight = container.clientHeight;
    let planeHeight = Math.max(10, totalHeight - PADDING * 2);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      totalWidth / -2,
      totalWidth / 2,
      totalHeight / 2,
      totalHeight / -2,
      0.1,
      1000
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(totalWidth, totalHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const vertexShader = `
      uniform float uVelocity;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;

        // Smooth parabolic curve horizontally
        float horizontalCurve = sin(uv.x * 3.14159265359);

        // Exponential falloff so top edge warps smoothly
        float topEdgeFactor = pow(uv.y, 2.8);

        // Displace vertices based on scroll velocity
        pos.y += horizontalCurve * uVelocity * topEdgeFactor;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      void main() {
        // Solid dark color matching zinc-950 (#09090b) with NO background grid lines
        gl_FragColor = vec4(0.035, 0.035, 0.043, 1.0);
      }
    `;

    let geometry = new THREE.PlaneGeometry(totalWidth, planeHeight, 128, 128);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { uVelocity: { value: 0 } },
      transparent: true
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        totalWidth = entry.contentRect.width;
        totalHeight = entry.contentRect.height;
        planeHeight = Math.max(10, totalHeight - PADDING * 2);

        camera.left = totalWidth / -2;
        camera.right = totalWidth / 2;
        camera.top = totalHeight / 2;
        camera.bottom = totalHeight / -2;
        camera.updateProjectionMatrix();

        renderer.setSize(totalWidth, totalHeight);

        plane.geometry.dispose();
        plane.geometry = new THREE.PlaneGeometry(totalWidth, planeHeight, 128, 128);
      }
    });
    resizeObserver.observe(container);

    let animationId: number;
    let lastTime = performance.now();
    const MAX_BEND = 90;

    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        velocityRef.current = self.getVelocity() / 60.0;
      }
    });

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Inverted (-velocity): pulls DOWN on scroll down, pushes UP on scroll up
      const targetVelocity = Math.tanh((-velocityRef.current * 16.0) / MAX_BEND) * MAX_BEND;
      const lerpSpeed = 10.0;

      smoothedVelocityRef.current += (targetVelocity - smoothedVelocityRef.current) * (1.0 - Math.exp(-lerpSpeed * dt));
      material.uniforms.uVelocity.value = smoothedVelocityRef.current;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      st.kill();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    // Expanded top/bottom canvas boundary to allow upward liquid wave to animate freely
    <div ref={containerRef} className="absolute -top-40 -bottom-40 left-0 right-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

// ---------------------------------------------------------------
// MAIN HOME PAGE COMPONENT
// ---------------------------------------------------------------
export default function Home({ projects }: { projects: Project[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const skewContentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const serviceRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  const settings = useSiteSettings();
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const delay = wordIndex === 0 ? 5000 : 2000;
    const timeout = setTimeout(() => {
      setWordIndex((prev) => {
        const nextIndex = prev + 1;
        return nextIndex % HERO_WORDS.length;
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [wordIndex]);

  useGSAP(
    () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      gsap.from(".hero-tag, .hero-sub, .stat-item", {
        opacity: 0, y: 30, duration: 1, stagger: 0.12, ease: "power3.out", delay: 0.35,
      });

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

      gsap.utils.toArray<HTMLElement>(".service-row").forEach((row) => {
        const revealTarget = row.querySelector(".service-reveal");
        const internalText = row.querySelector(".service-title-text");

        row.addEventListener("mouseenter", () => {
          gsap.killTweensOf([revealTarget, internalText]);
          gsap.to(revealTarget, { width: "auto", opacity: 1, x: 10, duration: 0.4, ease: "power2.out" });
          gsap.to(internalText, { x: 15, color: "#a855f7", duration: 0.3 });
        });
        row.addEventListener("mouseleave", () => {
          gsap.killTweensOf([revealTarget, internalText]);
          gsap.to(revealTarget, { width: 0, opacity: 0, x: 0, duration: 0.3, ease: "power2.in" });
          gsap.to(internalText, { x: 0, color: "#ffffff", duration: 0.3 });
        });
      });

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

  useGSAP(
    () => {
      gsap.fromTo(
        ".hero-char",
        { y: "115%", opacity: 0, rotateX: -90 },
        {
          y: "0%",
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          stagger: { amount: 0.4, ease: "power2.out", from: "start" },
          ease: "back.out(1.4)"
        }
      );
    },
    { scope: containerRef, dependencies: [wordIndex] }
  );

  return (
    <>
      <WhatsAppButton phoneNumber={settings.whatsapp_url} />
      <Cursor />
      <div ref={containerRef} style={{ viewTransitionName: "page-content" }} className="text-white min-h-screen overflow-x-hidden relative bg-transparent">
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
            </div>

            <div className="hero-title-wrapper w-full my-auto py-16 select-none overflow-hidden" style={{ perspective: 1200 }}>
              <div className="w-full max-w-full overflow-hidden py-4 flex items-center justify-center">
                <h1
                  className="hero-word block font-black leading-[0.85] tracking-[-0.03em] text-center uppercase text-white break-none"
                  style={{ fontSize: "clamp(3.5rem, 11.5vw, 10rem)" }}
                  data-cursor-text=" "
                >
                  <div key={wordIndex} className="flex items-center justify-center overflow-hidden flex-wrap">
                    {HERO_WORDS[wordIndex].split("").map((char, i) => (
                      <span key={i} className="hero-char-wrapper inline-block overflow-hidden">
                        <span
                          className="hero-char inline-block"
                          style={{ transformOrigin: "bottom center", willChange: "transform, opacity" }}
                        >
                          {char === " " ? "\u00A0" : char}
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
                <div ref={ctaRef} className="w-fit">
                  <TransitionLink
                    href="/projects"
                    data-cursor-pointer
                    className="hero-cta group flex items-center gap-4 bg-neutral-900 border border-neutral-800 px-6 py-4 rounded-full w-fit hover:bg-white transition-colors duration-500"
                  >
                    <span className="text-white group-hover:text-black text-xs uppercase tracking-widest font-mono font-bold transition-colors duration-500">Explore Our Projects</span>
                    <div className="w-2 h-2 rounded-full bg-purple-500 group-hover:bg-black transition-colors duration-500" />
                  </TransitionLink>
                </div>
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

          <DraggableMarquee />

          {/* SERVICES SECTION */}
          <section ref={serviceRef} id="service" className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-8 md:py-10 lg:py-10 relative z-10">
            <div className="max-w-7xl mx-auto w-full">
              <div className="mb-4 md:mb-5 lg:mb-5">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-light tracking-tight text-white">Next-Gen Development & IT Solutions</h2>
              </div>
              <div className="flex flex-col border-t border-neutral-800">
                {services.map((s, i) => (
                  <div
                    data-cursor-text="Click"
                    key={i}
                    data-cursor-pointer
                    className="service-row group flex flex-col md:flex-row md:items-center justify-between py-2 md:py-3 lg:py-2.5 border-b border-neutral-800 cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 md:gap-6 mb-1 md:mb-0">
                      <span className="text-xs font-mono text-neutral-600">0{i + 1}</span>
                      <h3 className="service-title-text text-base md:text-lg lg:text-lg font-normal text-white transition-transform duration-300 ease-out">{s.title}</h3>
                    </div>
                    <div className="flex items-center gap-6 justify-between md:justify-end md:w-1/2">
                      <p className="text-[11px] md:text-xs lg:text-sm text-neutral-500 max-w-xs md:text-right font-light leading-snug">{s.desc}</p>
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

          {/* ABOUT US SECTION (Removed top border and rounded clipping) */}
          <section id="about" className="min-h-screen relative z-20 px-6 md:px-16 flex items-center">

            <LiquidAboutBackground />

            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 py-24 relative z-10">
              <div className="about-text-col flex flex-col justify-center">
                <h2 className="about-title text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-white mb-8 leading-[1.1]">
                  Built for Growth
                </h2>
                <div className="space-y-6 text-neutral-400 text-base md:text-lg leading-relaxed font-light">
                  <p className="about-desc">At Innovelous Tech, we help businesses accelerate growth through AI powered solutions, custom software development, automation systems, and digital transformation strategies. Our mission is to bridge innovation with real-world business challenges. </p>
                </div>
                <div className="mt-10 flex items-center gap-6">
                  <div className="w-12 h-[1px] bg-purple-500/50"></div>
                  <span className="text-xs uppercase tracking-[0.2em] text-purple-400 font-mono">innovelous</span>
                </div>
              </div>
              <div className="about-stats-col flex flex-col justify-center gap-10 border-t border-neutral-800 pt-12 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-16">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-6 about-divider" style={{ transformOrigin: "left center" }}>
                  <span className="text-sm uppercase tracking-widest text-neutral-500 font-mono">Core Philosophy</span>
                  <span className="text-xl text-white font-light">Execution First</span>
                </div>
                <div className="flex items-center justify-between border-b border-neutral-800 pb-6 about-divider" style={{ transformOrigin: "left center" }}>
                  <span className="text-sm uppercase tracking-widest text-neutral-500 font-mono">PRODUCTION SPEED</span>
                  <span className="text-xl text-white font-light">Rapid MVP Deployment</span>
                </div>
                <div className="flex items-center justify-between about-divider" style={{ transformOrigin: "left center" }}>
                  <span className="text-sm uppercase tracking-widest text-neutral-500 font-mono">INFRASTRUCTURE</span>
                  <span className="text-xl text-white font-light">99.99% Reliable</span>
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
        </div>

        <ImpactSection />
        {settings.show_featured && <FeaturedProjectsClient projects={projects} />}
        <CubeSection />
        <InteractiveBentoFAQ />
        <ContactSection showCapabilities hasBackground={false} />
      </div>
    </>
  );
}
