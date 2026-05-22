"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

interface SceneProps {
  config: {
    geometry: 'torus' | 'icosahedron' | 'grid' | 'particles' | 'ring' | 'cube';
    color: string;
    wireframe: boolean;
  };
}

function DynamicGeometry({ config }: SceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // Memoize geometries to avoid recreation on config changes
  const geometries = useMemo(() => ({
    torus: new THREE.TorusKnotGeometry(1.2, 0.4, 100, 16),
    icosahedron: new THREE.IcosahedronGeometry(1.6, 2),
    grid: new THREE.BoxGeometry(1.5, 1.5, 1.5), // Will be used as grid cells in a loop
    particles: new THREE.SphereGeometry(1.5, 32, 32),
    ring: new THREE.TorusGeometry(1.4, 0.1, 16, 100),
    cube: new THREE.BoxGeometry(1.8, 1.8, 1.8),
  }), []);

  useEffect(() => {
    if (materialRef.current) {
      gsap.to(materialRef.current.color, {
        r: new THREE.Color(config.color).r,
        g: new THREE.Color(config.color).g,
        b: new THREE.Color(config.color).b,
        duration: 1.5,
        ease: "power3.inOut",
      });
      materialRef.current.wireframe = config.wireframe;
    }
  }, [config.color, config.wireframe]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
      
      // Subtle breathing scale
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} geometry={geometries[config.geometry]}>
        <meshStandardMaterial
          ref={materialRef}
          color={config.color}
          metalness={0.8}
          roughness={0.2}
          wireframe={config.wireframe}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

export default function SolutionHero({ config }: SceneProps) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        className="opacity-60"
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color={config.color} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#a855f7" />
        <DynamicGeometry config={config} />
      </Canvas>
    </div>
  );
}