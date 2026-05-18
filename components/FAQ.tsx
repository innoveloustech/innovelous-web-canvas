"use client";

import React, { useState, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// ─── TYPES & DATA CONFIGURATION ──────────────────────────────────────────────
interface FAQItem {
  id: number;
  index: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 0,
    index: "01",
    question: "What architecture paradigms define your technical approach?",
    answer: "We engineer systems around cloud-native, highly concurrent microservices written primarily in Go and Rust. Our frontends are decoupled headless architectures utilizing Next.js paired with sub-millisecond layout delivery structures to completely minimize client-side presentation friction.",
  },
  {
    id: 1,
    index: "02",
    question: "How do you guarantee performance scaling under heavy loads?",
    answer: "Every application pipeline is subjected to rigorous end-to-end telemetry testing. By engineering non-blocking I/O event loops, caching aggressively across globally distributed Edge networks, and optimizing relational/KV database execution layers, we lock in predictable scale profiles.",
  },
  {
    id: 2,
    index: "03",
    question: "Can your team interface with low-level systems or telemetry hardware?",
    answer: "Yes. Our engineering vectors extend past simple high-level web layers into embedded hardware development. We write optimized firmware, manage custom microcontrollers, and deploy real-time low-overhead spatial telemetry interfaces tailored for industrial networks.",
  },
  {
    id: 3,
    index: "04",
    question: "What metrics govern your post-deployment optimization lifecycle?",
    answer: "We track multi-layered performance data: client-side Core Web Vitals (INP, LCP, CLS), absolute time-to-first-byte (TTFB), database transaction contention loops, and compute infrastructure memory/CPU efficiency scaling to maintain elite performance boundaries.",
  },
];

// ─── SHADERS: DYNAMIC SURFACE GLOW TRANSITIONS ───────────────────────────────
const vertexShader = `
  uniform float uTime;
  uniform float uActiveIndex;
  varying vec3 vViewPosition;
  varying vec3 vModelPosition;

  void main() {
    vModelPosition = position;
    
    // Minimal organic surface wave inside the letter meshes
    float speed = uTime * 1.2;
    float wave = sin(position.x * 0.8 + speed) * cos(position.y * 0.8 + speed) * 0.05;
    
    vec3 newPosition = position + normal * wave;
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uActiveIndex;
  varying vec3 vViewPosition;
  varying vec3 vModelPosition;

  void main() {
    // Recompute surface normals for crisp specular reflections
    vec3 X = dFdx(vViewPosition);
    vec3 Y = dFdy(vViewPosition);
    vec3 normal = normalize(cross(X, Y));
    
    vec3 viewDir = normalize(vViewPosition);
    
    // Matte dark obsidian core paired with a high-contrast Fresnel rim curve
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5);
    vec3 baseVoid = vec3(0.01, 0.01, 0.015);
    
    // The surface shader itself dynamically updates color based on uActiveIndex
    vec3 surfaceColor = vec3(0.55, 0.22, 1.0); // 0: Tech Purple
    if (uActiveIndex > 0.5 && uActiveIndex <= 1.5) surfaceColor = vec3(0.0, 0.65, 0.95); // 1: Electric Cyan
    if (uActiveIndex > 1.5 && uActiveIndex <= 2.5) surfaceColor = vec3(0.00, 0.82, 0.45); // 2: Hyper Mint
    if (uActiveIndex > 2.5) surfaceColor = vec3(1.0, 0.30, 0.02); // 3: Molten Amber
    
    vec3 compositeBase = mix(baseVoid, surfaceColor, fresnel * 0.9);
    
    // Premium softbox light glaze line
    vec3 lightDir = normalize(vec3(0.3, 1.0, 0.5));
    vec3 halfVec = normalize(viewDir + lightDir);
    float highlight = pow(max(dot(normal, halfVec), 0.0), 140.0) * 1.6;
    
    vec3 finalOutput = compositeBase + vec3(highlight);
    
    gl_FragColor = vec4(finalOutput, 1.0);
  }
`;

// ─── 3D LOWERCASE "i" MESHES ─────────────────────────────────────────────────
interface LogoMeshProps {
  activeIndex: number;
}

function LowercaseILogo({ activeIndex }: LogoMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Build the vertical line geometry natively
  const stemGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.25, 0.7);
    shape.lineTo(0.25, 0.7);
    shape.lineTo(0.25, -1.1);
    shape.lineTo(-0.25, -1.1);
    shape.closePath();

    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.02,
      bevelSegments: 4,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uActiveIndex: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      // Lerp active index color coordinates flawlessly
      materialRef.current.uniforms.uActiveIndex.value += 
        (activeIndex - materialRef.current.uniforms.uActiveIndex.value) * 0.08;
    }

    if (groupRef.current) {
      // Clean corporate rotation matrices
      groupRef.current.rotation.y = Math.sin(time * 0.4) * 0.25;
      groupRef.current.rotation.x = Math.cos(time * 0.25) * 0.08;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.2}>
      <group ref={groupRef} scale={1.4}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent={true}
        />
        
        {materialRef.current && (
          <>
            {/* The vertical body/line of the 'i' */}
            <mesh geometry={stemGeometry} material={materialRef.current} position={[0, -0.2, 0]} />
            
            {/* The separated dot ball on top of the 'i' */}
            <mesh material={materialRef.current} position={[0, 1.0, 0.15]}>
              <sphereGeometry args={[0.3, 48, 48]} />
            </mesh>
          </>
        )}
      </group>
    </Float>
  );
}

// ─── MAIN ACCORDION LAYOUT MODULE ────────────────────────────────────────────
export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const faqSectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".faq-meta", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: faqSectionRef.current, start: "top 80%" },
      });

      gsap.from(".faq-item-row", {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: ".faq-container-grid", start: "top 75%" },
      });
    },
    { scope: faqSectionRef },
  );

  return (
    <section
      ref={faqSectionRef}
      id="faq"
      className="relative min-h-screen bg-zinc-950 px-6 md:px-16 py-32 flex flex-col justify-center overflow-hidden border-t border-white/5"
    >
      <div className="faq-container-grid relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        
        {/* Accordions */}
        <div className="lg:col-span-7 flex flex-col w-full">
          <div className="faq-meta flex flex-col gap-3 mb-16">
            <span className="text-[10px] font-mono text-purple-500 tracking-[0.25em] uppercase">
              // Core System Architectures
            </span>
            <h2 
              className="text-white font-light tracking-tight leading-[1.1] select-none"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.2rem)" }}
            >
              Frequently Asked <br />
              <span className="text-neutral-500 italic font-serif">Inquiries.</span>
            </h2>
          </div>

          <div className="flex flex-col border-t border-white/10 w-full">
            {faqData.map((item) => {
              const isOpen = activeIndex === item.id;
              
              return (
                <div
                  key={item.id}
                  className="faq-item-row group flex flex-col border-b border-white/10 py-6 cursor-pointer transition-colors duration-300"
                  onClick={() => setActiveIndex(item.id)}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-baseline gap-6 md:gap-10">
                      <span className="text-[10px] font-mono text-neutral-600 transition-colors duration-300 group-hover:text-purple-400">
                        {item.index}
                      </span>
                      <h3 className="text-white text-lg md:text-xl font-light tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                        {item.question}
                      </h3>
                    </div>
                    
                    <div className="relative w-4 h-4 mt-1.5 flex items-center justify-center flex-shrink-0">
                      <div className="absolute w-4 h-[1px] bg-neutral-500 transition-transform duration-500 ease-out" 
                        style={{ transform: isOpen ? "rotate(0deg)" : "rotate(90deg)" }}
                      />
                      <div className="absolute h-4 w-[1px] bg-neutral-500 transition-transform duration-500 ease-out"
                        style={{ opacity: isOpen ? 0 : 1 }}
                      />
                    </div>
                  </div>

                  <div
                    className="grid transition-all duration-500 ease-in-out pl-[34px] md:pl-[52px]"
                    style={{
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      opacity: isOpen ? 1 : 0,
                      marginTop: isOpen ? "1rem" : "0px",
                    }}
                  >
                    <div className="overflow-hidden">
                      <p className="text-neutral-400 font-light text-sm md:text-base leading-relaxed max-w-2xl pb-2">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3D Viewport Layer */}
        <div className="lg:col-span-5 w-full aspect-square max-w-[480px] lg:max-w-none justify-self-center lg:h-[550px] sticky top-24 flex items-center justify-center pointer-events-none">
          <div className="absolute w-full h-full inset-0 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.01] to-transparent border border-white/[0.03]">
            <Canvas
              camera={{ position: [0, 0, 3.8], fov: 45 }}
              gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
              style={{ background: "transparent" }}
            >
              <LowercaseILogo activeIndex={activeIndex} />
            </Canvas>
          </div>
          
          {/* Static subtle background ambient glow layer */}
          <div className="absolute -z-10 w-64 h-64 rounded-full opacity-[0.06] filter blur-[90px] bg-white pointer-events-none" />
        </div>

      </div>
    </section>
  );
}