"use client";

import React, { useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Text, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const testimonials = [
  { text: "WE SAW RESULTS WITHIN THE FIRST WEEK. IT'S INTUITIVE, FAST, AND RELIABLE.", author: "ALEX RIVERA", role: "PM, LAUNCHPAD", isDark: true },
  { text: "THIS PRODUCT COMPLETELY TRANSFORMED THE WAY OUR TEAM COLLABORATES. HIGHLY RECOMMEND!", author: "SARAH CHEN", role: "CTO, TECHNOVA", isDark: false },
  { text: "INCREDIBLE SUPPORT AND A SEAMLESS EXPERIENCE FROM START TO FINISH. FIVE STARS!", author: "PRIYA SHARMA", role: "LEAD DESIGNER, CREATIFY", isDark: true },
  { text: "THE BEST INVESTMENT WE'VE MADE THIS YEAR. OUR PRODUCTIVITY HAS DOUBLED SINCE ONBOARDING.", author: "JAMES MILLER", role: "CEO, BRIGHTPATH", isDark: false },
];

function CubeFace({
  position,
  rotation,
  data,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  data: (typeof testimonials)[0];
}) {
  // Swapped #000000 for zinc-950 hex (#09090b)
  const bgColor = data.isDark ? "#09090b" : "#ffffff";
  const textColor = data.isDark ? "#ffffff" : "#000000";
  const subTextColor = data.isDark ? "#a1a1aa" : "#52525b"; // zinc-400 / zinc-600

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Outer Border (Acts as the frame) */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial color={textColor} />
      </mesh>
      
      {/* 2. Inner Background (Slightly smaller, pushed forward to prevent z-fighting) */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[3.7, 3.7]} />
        <meshBasicMaterial color={bgColor} />
      </mesh>

      {/* 3. Elegant Quote Mark (Using proper typographic quote character) */}
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

      {/* 4. Main Testimonial Text */}
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

      {/* 5. Divider Line */}
      <mesh position={[-0.1, -1.1, 0.03]}>
        <planeGeometry args={[3.0, 0.04]} />
        <meshBasicMaterial color={textColor} />
      </mesh>

      {/* 6. Author Name */}
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

      {/* 7. Author Role */}
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
      {/* SOLID CORE: Updated color to match zinc-950 hex (#09090b) */}
      <mesh>
        <boxGeometry args={[4, 4, 4]} />
        <meshBasicMaterial color="#09090b" />
      </mesh>

      {/* 4 FACES: Placed exactly on the surface of the core box */}
      <CubeFace position={[0, 0, 2]}   rotation={[0, 0, 0]}           data={testimonials[0]} />
      <CubeFace position={[2, 0, 0]}   rotation={[0, Math.PI / 2, 0]} data={testimonials[1]} />
      <CubeFace position={[0, 0, -2]}  rotation={[0, Math.PI, 0]}     data={testimonials[2]} />
      <CubeFace position={[-2, 0, 0]}  rotation={[0, -Math.PI / 2, 0]}data={testimonials[3]} />
    </group>
  );
}

export default function CubeSection() {
  return (
    // Added bg-zinc-950 utility class here
    <div className="h-screen w-full flex items-center justify-center overflow-hidden relative bg-zinc-950">
      
      {/* Premium Top-Left Heading */}
      <div className="absolute top-10 left-10 z-10 pointer-events-none">
        <p className="text-zinc-500 text-xs font-bold tracking-[0.25em] uppercase mb-3">
          Client Feedback
        </p>
        <h2 className="text-zinc-100 text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
          Testimonials
        </h2>
      </div>

      <Canvas
        camera={{ position: [0, 0, 9], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Forces Three.js scene background to render as zinc-950 */}
        <color attach="background" args={["#09090b"]} />
        
        <ambientLight intensity={1.2} />
        <TestimonialCube />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}