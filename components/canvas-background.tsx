"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

const COUNT = 1500; // More particles, but smaller size = premium star-dust effect

const vertexShader = `
  uniform float uTime;
  varying vec3 vPosition;

  void main() {
    vPosition = position;
    vec3 pos = position;

    // Make the wave motion much gentler and slower
    pos.y += sin(uTime * 0.2 + pos.x * 0.1) * 0.4;
    pos.x += cos(uTime * 0.1 + pos.y * 0.1) * 0.2;

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
