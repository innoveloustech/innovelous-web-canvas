"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text3D, Center } from "@react-three/drei";
import * as THREE from "three";

export default function ThreeText() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const { pointer } = useThree();

  // Let's use a premium, ultra-smooth physical glass material config
  // This interacts perfectly with the particle light fields behind it
  const materialConfig = useMemo(
    () => ({
      color: "#ffffff",
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6, // Gives it a subtle refraction look
      ior: 1.5,
      thickness: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    }),
    [],
  );

  useFrame((state) => {
    if (!meshRef.current) return;

    // Track the normalized mouse position for structural parallax distortion
    // Lerping ensures the transitions are buttery smooth
    const targetX = pointer.x * 0.4;
    const targetY = pointer.y * 0.3;

    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetX,
      0.08,
    );
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      -targetY,
      0.08,
    );

    // Gentle breathing floating animation over time
    meshRef.current.position.y =
      Math.sin(state.clock.getElapsedTime() * 0.8) * 0.15;
  });

  return (
    <Center>
      <mesh ref={meshRef}>
        {/* Pass an open-source JSON font path (Inter Black / Helvetica Bold works best) */}
        <Text3D
          font="/fonts/Geist_Mono_Bold.json" // Make sure to place your converted typeface JSON in your public folder
          size={2.8}
          height={0.4}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.04}
          bevelSize={0.03}
          bevelOffset={0}
          bevelSegments={5}
        >
          INNOVELOUS
          <meshPhysicalMaterial ref={matRef} {...materialConfig} />
        </Text3D>
      </mesh>
    </Center>
  );
}
