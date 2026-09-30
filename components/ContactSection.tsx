"use client";

import { useRef, useState, useLayoutEffect, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

gsap.registerPlugin(ScrollTrigger);

const contactIcons = {
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  office: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

const LINES = [
  { text: "Ready to Build?", ghost: false },
  { text: "Let's Talk.", ghost: true },
];

// ─── Lightweight 2D Canvas Card Particles (0 WebGL Contexts, Zero Crash on Tab Switch) ──────
function CardParticles2D({ isHovered, mousePos }: { isHovered: boolean; mousePos: { x: number; y: number } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef(isHovered);
  const mouseRef = useRef(mousePos);

  useEffect(() => {
    hoverRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    mouseRef.current = mousePos;
  }, [mousePos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 320;
      height = canvas.height = canvas.offsetHeight || 220;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = 30;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * (width || 300),
      y: Math.random() * (height || 200),
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.5 + 0.8,
      baseAlpha: Math.random() * 0.2 + 0.1,
    }));

    let currentHover = 0;

    const render = () => {
      // Pause completely if tab is hidden / switched
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      currentHover += ((hoverRef.current ? 1 : 0) - currentHover) * 0.1;
      ctx.clearRect(0, 0, width, height);

      const targetX = ((mouseRef.current.x + 1) / 2) * width;
      const targetY = ((-mouseRef.current.y + 1) / 2) * height;

      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.x += p.vx * (1 + currentHover * 0.6);
        p.y += p.vy * (1 + currentHover * 0.6);

        if (currentHover > 0.05) {
          const dx = targetX - p.x;
          const dy = targetY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 1) {
            p.x += (dx / dist) * currentHover * 0.8;
            p.y += (dy / dist) * currentHover * 0.8;
          }
        }

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const alpha = p.baseAlpha + currentHover * 0.35;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = currentHover > 0.1
          ? `rgba(168, 85, 247, ${alpha})`
          : `rgba(140, 140, 160, ${alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block pointer-events-none"
    />
  );
}

interface ContactCardItem {
  index: string;
  category: string;
  primary: string;
  secondary: string;
  icon: React.ReactNode;
}

function ContactCard({ item }: { item: ContactCardItem }) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.primary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    setMousePos({ x, y });

    gsap.to(e.currentTarget, {
      rotateY: x * 6,
      rotateX: y * 6,
      transformPerspective: 800,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const onCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    const c = e.currentTarget;
    gsap.to(c, { borderColor: "rgba(168,85,247,0.45)", backgroundColor: "rgba(12, 12, 16, 0.65)", y: -5, duration: 0.35, ease: "power2.out" });
    const icon = c.querySelector(".card-icon-wrapper");
    const primary = c.querySelector(".card-primary");
    if (icon) gsap.to(icon, { scale: 1.1, color: "#a855f7", duration: 0.3, ease: "back.out(2)" });
    if (primary) gsap.to(primary, { x: 4, duration: 0.3, ease: "power2.out" });
  };

  const onCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(false);
    const c = e.currentTarget;
    gsap.to(c, {
      rotateY: 0,
      rotateX: 0,
      borderColor: "rgba(255,255,255,0.07)",
      backgroundColor: "rgba(255,255,255,0.015)",
      y: 0,
      duration: 0.5,
      ease: "power2.inOut",
    });
    const icon = c.querySelector(".card-icon-wrapper");
    const primary = c.querySelector(".card-primary");
    if (icon) gsap.to(icon, { scale: 1, color: "#71717a", duration: 0.25 });
    if (primary) gsap.to(primary, { x: 0, duration: 0.25 });
  };

  return (
    <div
      onClick={handleCopy}
      data-cursor-text={copied ? "COPIED" : "COPY"}
      className="contact-card relative flex flex-col gap-5 p-7 rounded-2xl border cursor-pointer overflow-hidden bg-zinc-950/40"
      style={{
        borderColor: copied ? "rgba(34, 197, 94, 0.45)" : "rgba(255,255,255,0.07)",
        backdropFilter: "blur(8px)",
        transition: "border-color 0.3s ease"
      }}
      onMouseMove={onCardMouseMove}
      onMouseEnter={onCardEnter}
      onMouseLeave={onCardLeave}
    >
      <div className="absolute inset-0 z-0 opacity-60 transition-opacity duration-300 hover:opacity-100 pointer-events-none">
        <CardParticles2D isHovered={isHovered} mousePos={mousePos} />
      </div>

      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-neutral-700 tracking-widest">{item.index}</span>
          <span className="card-icon-wrapper text-zinc-500">{item.icon}</span>
        </div>

        <span className="text-[10px] uppercase tracking-[0.28em] text-neutral-600 font-mono mt-4">
          {item.category}
        </span>

        <div className="flex flex-col gap-1.5 mt-10">
          <p className="card-primary text-white text-base md:text-lg font-light tracking-tight leading-snug">
            {item.primary}
            <span className={`ml-2 text-[10px] transition-opacity duration-300 ${copied ? "opacity-100 text-emerald-500" : "opacity-0"}`}>✓ Copied</span>
          </p>
          {item.secondary && <p className="text-neutral-500 text-sm font-light">{item.secondary}</p>}
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-12 h-12 rounded-br-2xl pointer-events-none" style={{
        background: "radial-gradient(circle at bottom right, rgba(168,85,247,0.1), transparent 70%)",
      }} />
    </div>
  );
}

function ScrubHeading() {
  const wrapRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const words = Array.from(wrap.querySelectorAll<HTMLSpanElement>(".scrub-word"));
    gsap.set(words, { opacity: 0.12 });
    const total = words.length;
    const triggers: ScrollTrigger[] = [];
    words.forEach((word, i) => {
      const startPct = 8 + (i / total) * 52;
      const endPct = startPct + 22;
      const st = ScrollTrigger.create({
        trigger: wrap,
        start: `top 60%`,
        end: `bottom 10%`,
        scrub: 1.4,
        onUpdate(self) {
          const wordStart = startPct / 100;
          const wordEnd = endPct / 100;
          const p = gsap.utils.clamp(0, 1, (self.progress - wordStart) / (wordEnd - wordStart));
          gsap.set(word, { opacity: 0.12 + p * 0.88 });
        },
      });
      triggers.push(st);
    });
    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <div ref={wrapRef} className="flex flex-col gap-0 overflow-visible select-none">
      {LINES.map(({ text, ghost }) => (
        <div key={text} className="font-light tracking-tight leading-[1.05] flex flex-wrap" style={{ fontSize: "clamp(2.8rem, 7.5vw, 7rem)" }}>
          {text.split(" ").map((word, i) => (
            <span key={`${text}-${i}`} className="scrub-word inline-block" style={{ marginRight: "0.28em", willChange: "opacity", color: ghost ? "transparent" : "white", WebkitTextStroke: ghost ? "1.5px rgba(255,255,255,0.75)" : undefined }}>
              {word}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

interface Props {
  showCapabilities: boolean;
  hasBackground?: boolean;
}

export default function ContactSection({ showCapabilities, hasBackground = true }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  useGSAP(() => {
    const s = sectionRef.current;
    if (!s) return;
    const fromConfig = (extra: gsap.TweenVars) => ({ opacity: 0, duration: 0.9, ease: "power3.out", ...extra });
    gsap.from(".contact-label", { ...fromConfig({ y: 20 }), scrollTrigger: { trigger: s, start: "top 78%" } });
    gsap.from(".contact-divider", { scaleX: 0, duration: 1.4, ease: "power3.inOut", scrollTrigger: { trigger: s, start: "top 70%" }, transformOrigin: "left center" });
    gsap.from(".contact-card", { ...fromConfig({ y: 50, stagger: 0.15 }), scrollTrigger: { trigger: ".contact-cards-grid", start: "top 82%" } });
    gsap.from(".social-link", { ...fromConfig({ x: -20, stagger: 0.1, duration: 0.7 }), scrollTrigger: { trigger: ".social-row", start: "top 90%" } });
    gsap.from(".contact-tagline", { ...fromConfig({ y: 30 }), scrollTrigger: { trigger: ".contact-tagline", start: "top 93%" } });
  }, { scope: sectionRef });

  const settings = useSiteSettings();

  const socialLinks = [
    { label: "Facebook", href: settings.facebook_url },
    { label: "GitHub", href: settings.github_url },
    { label: "Instagram", href: settings.instagram_url },
  ];

  const contactInfo = [
    { index: "01", category: "Email", primary: settings.email, secondary: "", icon: contactIcons.email },
    { index: "02", category: "Phone", primary: settings.phone, secondary: "", icon: contactIcons.phone },
    { index: "03", category: "Office", primary: settings.office_location, secondary: settings.office_address, icon: contactIcons.office },
  ];

  const onSocialEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const arrow = e.currentTarget.querySelector(".soc-arrow");
    gsap.killTweensOf(e.currentTarget);
    gsap.killTweensOf(arrow);
    gsap.to(e.currentTarget, { color: "#ffffff", duration: 0.25 });
    gsap.to(arrow, { x: 4, y: -4, opacity: 1, duration: 0.25 });
  };
  const onSocialMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
    gsap.to(e.currentTarget, { x, y, duration: 0.2, ease: "power2.out" });
  };
  const onSocialLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const arrow = e.currentTarget.querySelector(".soc-arrow");
    gsap.killTweensOf(e.currentTarget);
    gsap.killTweensOf(arrow);
    gsap.to(e.currentTarget, { x: 0, y: 0, color: "#71717a", duration: 0.4, ease: "elastic.out(1, 0.4)" });
    gsap.to(arrow, { x: 0, y: 0, opacity: 0, duration: 0.25 });
  };

  return (
    <section ref={sectionRef} id="contact" className={`relative min-h-screen ${hasBackground ? "bg-zinc-950" : "bg-transparent"} flex flex-col justify-center overflow-hidden px-6 md:px-16 py-24`}>
      <div className="absolute pointer-events-none" aria-hidden style={{ bottom: "-18%", left: "-8%", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(88,28,135,0.14) 0%, transparent 65%)", filter: "blur(48px)" }} />
      <div className="absolute pointer-events-none" aria-hidden style={{ top: "5%", right: "-10%", width: "38vw", height: "38vw", background: "radial-gradient(circle, rgba(88,28,135,0.08) 0%, transparent 65%)", filter: "blur(64px)" }} />
      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col gap-16">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="contact-label text-neutral-600 text-xs font-mono tracking-[0.2em] uppercase hidden md:block">Always On — 24 / 7 / 365</span>
          </div>
          <ScrubHeading />
          <div className="contact-divider h-[1px] w-full bg-neutral-800" style={{ transformOrigin: "left center" }} />
        </div>
        <div className="contact-cards-grid grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactInfo.map((item) => <ContactCard key={item.index} item={item} />)}
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <div className="flex flex-col gap-4">
            <span className="text-[10px] uppercase tracking-[0.28em] text-neutral-600 font-mono">Follow Along</span>
            <div className="social-row flex flex-wrap items-center gap-x-8 gap-y-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  data-cursor="-exclusion"
                  className="social-link flex items-center gap-1.5 text-sm text-zinc-500 font-light tracking-wide inline-block"
                  onMouseEnter={onSocialEnter}
                  onMouseMove={onSocialMouseMove}
                  onMouseLeave={onSocialLeave}
                >
                  {s.label}
                  <span className="soc-arrow opacity-0 inline-block">↗</span>
                </a>
              ))}
            </div>
          </div>
          <div className="contact-tagline flex flex-col items-start md:items-end gap-2 max-w-sm">
            <p className="text-neutral-500 text-sm font-light leading-relaxed md:text-right">Based in Karachi.<br />Engineering Scalable Solutions Nationwide.</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ boxShadow: "0 0 6px rgba(16,185,129,0.75)", animation: "ct-pulse 2.5s ease-in-out infinite" }} />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">Accepting Projects — 2026</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-neutral-900 pt-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-neutral-700 tracking-widest uppercase">© 2026 Innovelous Tech</span>
            <a href="https://github.com/sarwanazhar" target="_blank" rel="noopener noreferrer" data-cursor="-hidden" className="text-[9px] font-mono text-neutral-600 hover:text-purple-400 tracking-widest uppercase transition-colors duration-200">
              Website by Sarwan Azhar
            </a>
          </div>
          <Link href="/privacy" data-cursor="-exclusion" className="text-[10px] font-mono text-neutral-500 hover:text-purple-400 tracking-widest uppercase transition-colors duration-200">Privacy Policy</Link>
          <span className="text-[10px] font-mono text-neutral-700 tracking-widest uppercase hidden md:block">All Rights Reserved</span>
        </div>
      </div>
      <style>{`@keyframes ct-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }`}</style>
    </section>
  );
}