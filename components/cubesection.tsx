"use client";

import React, { useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Text, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useTestimonials } from "@/components/SiteSettingsProvider";

function CubeFace({
  position,
  rotation,
  data,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  data: { text: string; author: string; role: string; isDark: boolean };
}) {
  // #09090b is the hex code for Tailwind's zinc-950
  const bgColor = data.isDark ? "#09090b" : "#ffffff";
  const textColor = data.isDark ? "#ffffff" : "#000000";
  const subTextColor = data.isDark ? "#a1a1aa" : "#52525b";

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Outer Border */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial color={textColor} />
      </mesh>

      {/* 2. Inner Background */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[3.7, 3.7]} />
        <meshBasicMaterial color={bgColor} />
      </mesh>

      {/* 3. Quote Mark */}
      <Text
        position={[-1.6, 1.5, 0.03]}
        fontSize={1.2}
        color={textColor}
        anchorX="left"
        anchorY="top"
        fontWeight="bold"
      >
        “
      </Text>

      {/* 4. Testimonial Text */}
      <Text
        position={[-1.6, 0.8, 0.03]}
        fontSize={0.24}
        maxWidth={3.2}
        color={textColor}
        textAlign="left"
        anchorX="left"
        anchorY="top"
        lineHeight={1.4}
        letterSpacing={-0.01}
        fontWeight="bold"
      >
        {data.text}
      </Text>

      {/* 5. Divider */}
      <mesh position={[-0.1, -1.1, 0.03]}>
        <planeGeometry args={[3.0, 0.04]} />
        <meshBasicMaterial color={textColor} />
      </mesh>

      {/* 6. Author */}
      <Text
        position={[-1.6, -1.35, 0.03]}
        fontSize={0.18}
        color={textColor}
        textAlign="left"
        anchorX="left"
        anchorY="top"
        letterSpacing={0.05}
        fontWeight="bold"
      >
        {data.author}
      </Text>

      {/* 7. Role */}
      <Text
        position={[-1.6, -1.6, 0.03]}
        fontSize={0.12}
        color={subTextColor}
        textAlign="left"
        anchorX="left"
        anchorY="top"
        letterSpacing={0.1}
        fontWeight="normal"
      >
        {data.role}
      </Text>
    </group>
  );
}

function TestimonialCube() {
  const testimonials = useTestimonials();
  const groupRef = useRef<THREE.Group>(null);
  const { size } = useThree();

  const isMobile = size.width < 768;
  const currentScale = isMobile ? 0.55 : 0.95;

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group ref={groupRef} scale={[currentScale, currentScale, currentScale]}>
      {/* SOLID CORE: Matches zinc-950 */}
      <mesh>
        <boxGeometry args={[4, 4, 4]} />
        <meshBasicMaterial color="#09090b" />
      </mesh>

      {testimonials.map((t, i) => {
        const positions: [number, number, number][] = [[0, 0, 2], [2, 0, 0], [0, 0, -2], [-2, 0, 0]];
        const rotations: [number, number, number][] = [[0, 0, 0], [0, Math.PI / 2, 0], [0, Math.PI, 0], [0, -Math.PI / 2, 0]];
        return (
          <CubeFace key={t.id} position={positions[i] || [0, 0, 0]} rotation={rotations[i] || [0, 0, 0]}
            data={{ text: t.text, author: t.author, role: t.role, isDark: t.is_dark }}
          />
        );
      })}
    </group>
  );
}

export default function CubeSection() {
  const [domElement, setDomElement] = useState<HTMLDivElement | null>(null);

  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden relative rounded-b-3xl">

      <div className="absolute top-10 left-10 z-10 pointer-events-none">
        <p className="text-zinc-500 text-xs font-bold tracking-[0.25em] uppercase mb-3">
          Client Feedback
        </p>
        <h2 className="text-zinc-100 text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
          Testimonials
        </h2>
      </div>

      <div
        ref={setDomElement}
        className="absolute w-[80vw] h-[80vw] max-w-[350px] max-h-[350px] md:max-w-[600px] md:max-h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 touch-none"
      />

      <Canvas
        camera={{ position: [0, 0, 9], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.2} />
        <TestimonialCube />

        {domElement && (
          <OrbitControls
            domElement={domElement}
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            enableDamping={true}
            dampingFactor={0.05}
          />
        )}
      </Canvas>
    </div>
  );
}