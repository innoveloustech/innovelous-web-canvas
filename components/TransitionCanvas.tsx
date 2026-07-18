"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useRouter } from "next/navigation";

// ==========================================
// 1. GLSL HELPER FUNCTIONS & UNIFORMS
// ==========================================
const glslHelpers = `
  uniform float uProgress;
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uHighlight; 
  varying vec2 vUv;

  #define PI 3.14159265359

  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise(in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f*f*(3.0-2.0*f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // Fractal Brownian Motion for deeper textures
  float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 5; i++) {
          value += amplitude * noise(st);
          st *= 2.0;
          amplitude *= 0.5;
      }
      return value;
  }
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ==========================================
// 2. SHADER DEFINITIONS (6 EFFECTS)
// ==========================================
const SHADERS = {

  // 🕳️ Black Hole (Dark purple focal center)
  blackHole: `
    ${glslHelpers}
    void main() {
      float dist = distance(vUv, vec2(0.5));
      float pull = smoothstep(0.0, 1.0, uProgress);
      float alpha = smoothstep(pull * 1.5, pull * 1.5 - 0.1, dist);
      
      vec3 holeColor = mix(uHighlight, uColor, smoothstep(0.0, 0.2, dist));
      gl_FragColor = vec4(holeColor, alpha * step(0.001, uProgress));
    }
  `,

  // 🪟 Cube Flip (Dark purple shadow/fold edges)
  cubeFlip: `
    ${glslHelpers}
    void main() {
      float progressSweep = uProgress * 1.4 - 0.2;
      float fold = smoothstep(progressSweep - 0.1, progressSweep + 0.1, vUv.x);
      float shadowIntensity = (1.0 - smoothstep(0.0, 0.2, abs(vUv.x - progressSweep))) * 0.5 * sin(uProgress * PI);
      
      vec3 foldColor = mix(uColor, uHighlight, shadowIntensity);
      gl_FragColor = vec4(foldColor, (1.0 - fold) * step(0.001, uProgress));
    }
  `,

  // 🌊 Fluid Distortion Warp (Tinted with dark purple highlights)
  fluid: `
    ${glslHelpers}
    void main() {
      float n = noise(vUv * 5.0 + uTime * 2.0) * 0.1;
      float progressSweep = uProgress * 1.4 - 0.2; 
      float alpha = 1.0 - smoothstep(progressSweep - 0.1, progressSweep + 0.1, vUv.y + n);
      
      vec3 fluidColor = mix(uColor, uHighlight, n * 2.0 + 0.2);
      gl_FragColor = vec4(fluidColor, alpha * step(0.001, uProgress));
    }
  `,

  // 🌫️ Particle Disintegration (Dark purple sparks)
  particles: `
    ${glslHelpers}
    void main() {
      vec2 grid = floor(vUv * 150.0);
      float delay = random(grid);
      float chaos = noise(vUv * 20.0 + uTime * 5.0) * 0.2;
      float alpha = step(delay + chaos, uProgress * 1.5 - 0.01);
      
      vec3 particleColor = mix(uColor, uHighlight, chaos * 3.0);
      gl_FragColor = vec4(particleColor, alpha * step(0.001, uProgress));
    }
  `,

  // 🌀 RGB Chromatic Glitch (Dark purple offset splits)
  rgbGlitch: `
    ${glslHelpers}
    void main() {
      float glitchAmount = sin(uProgress * PI) * 0.1; 
      float noiseVal = random(floor(vUv * 40.0) + uTime);
      
      float r = step(noiseVal, uProgress + glitchAmount);
      float g = step(noiseVal, uProgress);
      float b = step(noiseVal, uProgress - glitchAmount);
      
      float finalAlpha = max(r, max(g, b));
      vec3 finalColor = mix(uColor, vec3(r, g, b) * uHighlight, finalAlpha);
      
      gl_FragColor = vec4(finalColor, finalAlpha * step(0.001, uProgress));
    }
  `,

  // 🕸️ Cloth Rip (Dark purple stained tear ripple)
  clothRip: `
    ${glslHelpers}
    void main() {
      float ripIntensity = sin(uProgress * PI) * 0.5;
      vec2 warpedUv = vUv;
      warpedUv.x += sin(vUv.y * 15.0 + uTime * 10.0) * ripIntensity;
      
      float tear = warpedUv.x + warpedUv.y;
      float alpha = smoothstep(uProgress * 2.5 - 0.2, uProgress * 2.5 + 0.2, tear);
      
      vec3 ripColor = mix(uColor, uHighlight, (1.0 - alpha) * 0.2);
      gl_FragColor = vec4(ripColor, (1.0 - alpha) * step(0.001, uProgress));
    }
  `,

};

// ==========================================
// 3. ACTIVE SHADER — locked to RGB Glitch
// ==========================================
const ACTIVE_SHADER: keyof typeof SHADERS = "rgbGlitch";

// ==========================================
// 4. R3F COMPONENT WITH GSAP ROUTING
// ==========================================
function PixelShaderScene() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const router = useRouter();
  const isTransitioning = useRef(false);
  const { viewport } = useThree();

  // Always use the RGB Glitch shader

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0.0 },
      uTime: { value: 0.0 },
      uColor: { value: new THREE.Color("#0a0a0a") },       // Deep Black Background
      uHighlight: { value: new THREE.Color("#1a0a2e") },   // Very Dark Purple Accent
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  useEffect(() => {
    const handleStart = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { href } = customEvent.detail;
      if (!materialRef.current || isTransitioning.current) return;

      isTransitioning.current = true;

      // Ensure the RGB Glitch shader is active
      materialRef.current.fragmentShader = SHADERS[ACTIVE_SHADER];
      materialRef.current.needsUpdate = true;

      const uProgress = materialRef.current.uniforms.uProgress;

      // Single self-contained timeline:
      //   1. Glitch sweeps in (1.2s)
      //   2. Navigate to new page at the peak
      //   3. Glitch sweeps back out (0.9s)
      // This prevents any double-navigation and the resulting black screen.
      gsap.timeline()
        .to(uProgress, {
          value: 1.0,
          duration: 0.75,
          ease: "power2.inOut",
        })
        .call(() => {
          // Navigate at the glitch peak — page swap is hidden under the overlay
          router.push(href);
        })
        .to(uProgress, {
          value: 0.0,
          duration: 0.5,
          ease: "power2.inOut",
          delay: 0.1,
          onComplete: () => {
            isTransitioning.current = false;
            document.body.style.pointerEvents = "";
          },
        });
    };

    window.addEventListener("start-3d-transition", handleStart);
    return () => window.removeEventListener("start-3d-transition", handleStart);
  }, [router]);

  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={SHADERS[ACTIVE_SHADER]}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
}

// ==========================================
// 5. MAIN EXPORT
// ==========================================
export default function TransitionCanvas() {
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ pointerEvents: "none" }}
      >
        <PixelShaderScene />
      </Canvas>
    </div>
  );
}