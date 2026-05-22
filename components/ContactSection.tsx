"use client";

import { useRef, useMemo, useState, useLayoutEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

// ─── Contact data ────────────────────────────────────────────────────────────
const contactInfo = [
  {
    index: "01",
    category: "Email",
    primary: "innoveloustechno@gmail.com",
    secondary: "",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    index: "02",
    category: "Phone",
    primary: "+92 333 2186309",
    secondary: "+92 333 2186309",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    index: "03",
    category: "Office",
    primary: "123 Innovation Drive",
    secondary: "San Francisco, CA 94107",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const socialLinks = [
  { label: "LinkedIn", href: "#" },
  { label: "Twitter / X", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "Instagram", href: "#" },
];

const LINES = [
  { text: "Let's Build", ghost: false },
  { text: "Something Real.", ghost: true },
];

// ─── Declarative R3F Hover Interactive Particles ──────────────────────────────
const CARD_COUNT = 350; // Focused count per card for excellent frame-rates

const cardVertexShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  varying vec3 vPosition;
  varying float vDistToMouse;

  void main() {
    vPosition = position;
    vec3 pos = position;

    // Ambient floating wave motion
    pos.y += sin(uTime * 0.4 + pos.x * 0.3) * 0.15;
    pos.x += cos(uTime * 0.3 + pos.y * 0.3) * 0.10;

    // Gravitational pull towards the tracking normalized mouse space on hover
    vec3 targetMousePos = vec3(uMouse * 10.0, 0.0);
    float dist = distance(pos, targetMousePos);
    vDistToMouse = dist;

    if (uHover > 0.01) {
      // Pull particles smoothly closer along the delta vector space
      vec3 direction = targetMousePos - pos;
      float pullForce = smoothstep(8.0, 0.0, dist) * uHover * 0.35;
      pos += direction * pullForce;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Micro star dust dots matching your custom lens scale profile
    gl_PointSize = 0.55 * (300.0 / -mvPosition.z);
  }
`;

const cardFragmentShader = `
  varying float vDistToMouse;
  uniform float uHover;

  void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    if (distanceToCenter > 0.5) discard;

    // Base color profile transitions from premium zinc-gray into electric violet on cursor proximity
    vec3 baseColor = vec3(0.44, 0.44, 0.50); // Muted Zinc dust
    vec3 hoverColor = vec3(0.66, 0.33, 0.97); // Electric Neon Purple (#a855f7)

    float interactionGlow = smoothstep(4.0, 0.0, vDistToMouse) * uHover;
    vec3 finalColor = mix(baseColor, hoverColor, interactionGlow);

    // Increase alpha brilliance around the pointer hot-spot paths
    float alphaProfile = (0.09 + interactionGlow * 0.16) * (1.0 - distanceToCenter * 2.0);

    gl_FragColor = vec4(finalColor, alphaProfile);
  }
`;

function CardParticles({ isHovered, mousePos }: { isHovered: boolean; mousePos: THREE.Vector2 }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(CARD_COUNT * 3);
    for (let i = 0; i < CARD_COUNT; i++) {
      // Localized box bounds inside each standard HTML layout frame
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;

      // Interpolate hover state for smooth inertial entry and exit transitions
      const targetHover = isHovered ? 1.0 : 0.0;
      materialRef.current.uniforms.uHover.value += (targetHover - materialRef.current.uniforms.uHover.value) * 0.1;

      // Interpolate tracking mouse space updates
      materialRef.current.uniforms.uMouse.value.lerp(mousePos, 0.1);
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.z = time * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={cardVertexShader}
        fragmentShader={cardFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Individual Card Dynamic Interactive Space ─────────────────────────────────
function ContactCard({ item }: { item: typeof contactInfo[0] }) {
  const [isHovered, setIsHovered] = useState(false);
  const mousePos = useMemo(() => new THREE.Vector2(0, 0), []);

  const onCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Normalize coordinates into matching system boundaries (-1.0 to 1.0)
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mousePos.set(x, y);
  };

  const onCardEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    const c = e.currentTarget;
    gsap.to(c, {
      borderColor: "rgba(168,85,247,0.45)",
      backgroundColor: "rgba(12, 12, 16, 0.65)",
      y: -5,
      duration: 0.35,
      ease: "power2.out",
    });
    const icon = c.querySelector(".card-icon-wrapper");
    const primary = c.querySelector(".card-primary");
    if (icon) gsap.to(icon, { scale: 1.1, color: "#a855f7", duration: 0.3, ease: "back.out(2)" });
    if (primary) gsap.to(primary, { x: 4, duration: 0.3, ease: "power2.out" });
  };

  const onCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(false);
    const c = e.currentTarget;
    gsap.to(c, {
      borderColor: "rgba(255,255,255,0.07)",
      backgroundColor: "rgba(255,255,255,0.015)",
      y: 0,
      duration: 0.3,
      ease: "power2.inOut",
    });
    const icon = c.querySelector(".card-icon-wrapper");
    const primary = c.querySelector(".card-primary");
    if (icon) gsap.to(icon, { scale: 1, color: "#71717a", duration: 0.25 });
    if (primary) gsap.to(primary, { x: 0, duration: 0.25 });
  };

  return (
    <div
      data-cursor-text="COPY"
      className="contact-card relative flex flex-col gap-5 p-7 rounded-2xl border cursor-default overflow-hidden bg-zinc-950/40"
      style={{
        borderColor: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(8px)",
      }}
      onMouseMove={onCardMouseMove}
      onMouseEnter={onCardEnter}
      onMouseLeave={onCardLeave}
    >
      {/* ── EMBEDDED R3F ENGINE LAYER ── */}
      <div className="absolute inset-0 z-0 opacity-60 transition-opacity duration-300 hover:opacity-100 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: false, powerPreference: "high-performance" }}>
          <CardParticles isHovered={isHovered} mousePos={mousePos} />
        </Canvas>
      </div>

      {/* Content layout stacks on top with pointer safety guarantees */}
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

// ─── Scrub-reveal heading ──────────────────────────────────────────────────────
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
        <div
          key={text}
          className="font-light tracking-tight leading-[1.05] flex flex-wrap"
          style={{ fontSize: "clamp(2.8rem, 7.5vw, 7rem)" }}
        >
          {text.split(" ").map((word, i) => (
            <span
              key={`${text}-${i}`}
              className="scrub-word inline-block"
              style={{
                marginRight: "0.28em",
                willChange: "opacity",
                color: ghost ? "transparent" : "white",
                WebkitTextStroke: ghost ? "1.5px rgba(255,255,255,0.75)" : undefined,
              }}
            >
              {word}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
interface Props {
  showCapabilities: boolean;   // required
  // or optional: showCapabilities?: boolean;
}

// ─── Main Section Viewport Export ──────────────────────────────────────────────
export default function ContactSection({ showCapabilities }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const s = sectionRef.current;
      if (!s) return;

      const fromConfig = (extra: gsap.TweenVars) => ({
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        ...extra,
      });

      gsap.from(".contact-label", {
        ...fromConfig({ y: 20 }),
        scrollTrigger: { trigger: s, start: "top 78%" },
      });

      gsap.from(".contact-divider", {
        scaleX: 0,
        duration: 1.4,
        ease: "power3.inOut",
        scrollTrigger: { trigger: s, start: "top 70%" },
        transformOrigin: "left center",
      });

      gsap.from(".contact-card", {
        ...fromConfig({ y: 50, stagger: 0.15 }),
        scrollTrigger: { trigger: ".contact-cards-grid", start: "top 82%" },
      });

      gsap.from(".social-link", {
        ...fromConfig({ x: -20, stagger: 0.1, duration: 0.7 }),
        scrollTrigger: { trigger: ".social-row", start: "top 90%" },
      });

      gsap.from(".contact-tagline", {
        ...fromConfig({ y: 30 }),
        scrollTrigger: { trigger: ".contact-tagline", start: "top 93%" },
      });
    },
    { scope: sectionRef },
  );

  const onSocialEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, { color: "#ffffff", duration: 0.25 });
    gsap.to(e.currentTarget.querySelector(".soc-arrow"), { x: 4, y: -4, opacity: 1, duration: 0.25 });
  };
  const onSocialLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, { color: "#71717a", duration: 0.25 });
    gsap.to(e.currentTarget.querySelector(".soc-arrow"), { x: 0, y: 0, opacity: 0, duration: 0.25 });
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative min-h-screen bg-zinc-950 flex flex-col justify-center overflow-hidden px-6 md:px-16 py-24"
    >
      <div className="absolute pointer-events-none" aria-hidden style={{
        bottom: "-18%", left: "-8%",
        width: "60vw", height: "60vw",
        background: "radial-gradient(circle, rgba(88,28,135,0.14) 0%, transparent 65%)",
        filter: "blur(48px)",
      }} />
      <div className="absolute pointer-events-none" aria-hidden style={{
        top: "5%", right: "-10%",
        width: "38vw", height: "38vw",
        background: "radial-gradient(circle, rgba(88,28,135,0.08) 0%, transparent 65%)",
        filter: "blur(64px)",
      }} />

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col gap-16">

        {/* Top heading stack */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            {showCapabilities && (
              <span className="contact-label text-purple-500 text-xs font-mono tracking-[0.3em] uppercase">
                03 // CONTACT
              </span>
            )}
            <span className="contact-label text-neutral-600 text-xs font-mono tracking-[0.2em] uppercase hidden md:block">
              Always On — 24 / 7 / 365
            </span>
          </div>

          <ScrubHeading />

          <div className="contact-divider h-[1px] w-full bg-neutral-800" style={{ transformOrigin: "left center" }} />
        </div>

        {/* ── Cards Grid mapping isolated instances ── */}
        <div className="contact-cards-grid grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactInfo.map((item) => (
            <ContactCard key={item.index} item={item} />
          ))}
        </div>

        {/* Bottom Social Row */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <div className="flex flex-col gap-4">
            <span className="text-[10px] uppercase tracking-[0.28em] text-neutral-600 font-mono">
              Follow Along
            </span>
            <div className="social-row flex flex-wrap items-center gap-x-8 gap-y-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  data-cursor="-exclusion"
                  className="social-link flex items-center gap-1.5 text-sm text-zinc-500 font-light tracking-wide inline-block"
                  onMouseEnter={onSocialEnter}
                  onMouseLeave={onSocialLeave}
                >
                  {s.label}
                  <span className="soc-arrow opacity-0 inline-block">↗</span>
                </a>
              ))}
            </div>
          </div>

          <div className="contact-tagline flex flex-col items-start md:items-end gap-2 max-w-sm">
            <p className="text-neutral-500 text-sm font-light leading-relaxed md:text-right">
              Headquartered in Karachi.
              <br />Operating everywhere that matters.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                style={{
                  boxShadow: "0 0 6px rgba(16,185,129,0.75)",
                  animation: "ct-pulse 2.5s ease-in-out infinite",
                }}
              />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500">
                Accepting Projects — 2026
              </span>
            </div>
          </div>
        </div>

        {/* Footer line */}
        <div className="flex items-center justify-between border-t border-neutral-900 pt-6">
          <span className="text-[10px] font-mono text-neutral-700 tracking-widest uppercase">
            © 2026 Innovelous Tech
          </span>
          <span className="text-[10px] font-mono text-neutral-700 tracking-widest uppercase hidden md:block">
            All Rights Reserved
          </span>
        </div>

      </div>

      <style>{`
        @keyframes ct-pulse {
          0%, 100% { opacity: 1;   transform: scale(1);    }
          50%       { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </section>
  );
}