"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

const COUNT = 1500;
// More particles, but smaller size = premium star-dust effect

const vertexShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec3 vPosition;

  void main() {
    vPosition = position;
    vec3 pos = position;

    // Make the wave motion much gentler and slower
    pos.y += sin(uTime * 0.2 + pos.x * 0.1) * 0.4;
    pos.x += cos(uTime * 0.1 + pos.y * 0.1) * 0.2;

    // --- Mouse Repulsion Logic ---
    vec2 dir = pos.xy - uMouse;
    float dist = length(dir);
    // 12.0 is the radius of influence. Particles inside this radius are pushed away.
    float force = smoothstep(12.0, 0.0, dist); 
    // 3.5 is the max displacement intensity.
    pos.xy += normalize(dir + vec2(0.0001)) * force * 3.5; 

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // CRITICAL: Drastically reduced the default multiplier from 3.0 down to 0.65
    // This stops particles from turning into giant blurry blobs when near the camera lens
    gl_PointSize = 0.65 * (300.0 / -mvPosition.z);
  }
`;

const fragmentShader = `
  void main() {
    float distance = length(gl_PointCoord - vec2(0.5));
    if (distance > 0.5) discard;

    // Lowered opacity to 0.15 and shifted the color to a sharper, less muddy neon-purple
    gl_FragColor = vec4(0.70, 0.40, 1.0, 0.15 * (1.0 - distance * 2.0));
  }
`;

function ParticleField() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Mouse tracking references
  const targetMouse = useRef(new THREE.Vector2(-9999, -9999));
  const currentMouse = useRef(new THREE.Vector2(-9999, -9999));
  const mouseVec3 = useRef(new THREE.Vector3());

  // Capture global mouse movements because the canvas container is pointer-events-none
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Map mouse to Normalized Device Coordinates (-1 to +1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetMouse.current.set(x, y);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const positions = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      // Pushed the boundaries wider so they cover the outer layout edges natively
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(-9999, -9999) },
    }),
    [],
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (materialRef.current) materialRef.current.uniforms.uTime.value = time;
    
    if (pointsRef.current) {
      // Incredibly slow rotation so it mimics a natural atmosphere rather than a spinning vortex
      pointsRef.current.rotation.z = time * 0.002;
      pointsRef.current.rotation.y = time * 0.004;

      // Convert target NDC mouse coordinates to actual 3D viewport coordinates
      const mouseX = (targetMouse.current.x * state.viewport.width) / 2;
      const mouseY = (targetMouse.current.y * state.viewport.height) / 2;
      const targetViewportMouse = new THREE.Vector2(mouseX, mouseY);

      // Smooth interpolation for fluid hover tracking
      currentMouse.current.lerp(targetViewportMouse, 0.08);

      // Transform the world/viewport mouse coordinates into the slowly rotating local space of the points
      mouseVec3.current.set(currentMouse.current.x, currentMouse.current.y, 0);
      pointsRef.current.worldToLocal(mouseVec3.current);

      // Update shader uniform
      if (materialRef.current) {
        materialRef.current.uniforms.uMouse.value.set(mouseVec3.current.x, mouseVec3.current.y);
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function CanvasBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none bg-black">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 55 }}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
        }}
      >
        <ParticleField />
      </Canvas>
    </div>
  );
}