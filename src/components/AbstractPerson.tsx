import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Heart, Glasses } from 'lucide-react';

// Custom Lips Icon
const LipsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 21c-4.97 0-9-2.24-9-5 0-1.28 1.1-2.43 2.83-3.23.46-.22.95-.41 1.48-.58.33-.1.68-.19 1.03-.26 1.12-.22 2.36-.34 3.66-.34s2.54.12 3.66.34c.35.07.7.16 1.03.26.53.17 1.02.36 1.48.58C19.9 13.57 21 14.72 21 16c0 2.76-4.03 5-9 5z"/>
    <path d="M12 16c-3.31 0-6 1.12-6 2.5S8.69 21 12 21s6-1.12 6-2.5-2.69-2.5-6-2.5z" opacity="0.4"/>
    <path d="M3 16c0-1.42 1.39-2.68 3.53-3.46M21 16c0-1.42-1.39-2.68-3.53-3.46"/>
  </svg>
);

// The 2D UI marker
const PersonPartMarker = ({ id, label, icon: Icon, colorClasses, activePart, setActivePart }: any) => {
  const isHovered = activePart === id;
  return (
    <div 
      className={`relative cursor-pointer group flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2`}
      onMouseEnter={() => setActivePart(id)}
      onMouseLeave={() => setActivePart(null)}
    >
      {/* Pulsing Aura for the marker itself */}
      <div className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-500 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'} ${colorClasses}`} />
      
      {/* Glassmorphism Icon Container */}
      <div className={`relative z-10 p-3 md:p-4 rounded-2xl border ${isHovered ? 'border-white/60 bg-white/20' : 'border-white/20 bg-white/5'} backdrop-blur-xl transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.1)] group-hover:scale-110`}>
        <Icon className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 ${isHovered ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-white/60'}`} />
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            className="absolute top-full mt-4 whitespace-nowrap text-[10px] md:text-xs font-black tracking-[0.2em] uppercase text-white bg-black/40 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-2xl pointer-events-none shadow-2xl"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ThermalBust = ({ activePart, setActivePart }: any) => {
  const groupRef = useRef<any>();
  
  // Make the entire model gently breathe/float to feel alive
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Base y is -2.5 to move the person further down
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.15 - 2.5;
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, -2.5, 0]}>
      
      {/* --- 3D Volumes for the Thermal Blur --- */}
      {/* Simple bust pose without the arm/phone. */}

      {/* Core Torso (Pinkish Red) */}
      <mesh position={[0, 0.0, 0]} scale={[1.5, 2.0, 1.2]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#ec4899" /> 
      </mesh>

      {/* Shoulders (Lime Green) */}
      <mesh position={[0, 1.5, 0]} scale={[1.8, 0.8, 1.0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#bef264" /> 
      </mesh>
      
      {/* Neck (Orange) */}
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 1.2, 32]} />
        <meshBasicMaterial color="#fb923c" /> 
      </mesh>

      {/* Top of Head (Mint Green) */}
      <mesh position={[0, 3.5, 0]} scale={[0.9, 1.0, 1]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#4ade80" /> 
      </mesh>

      {/* Face (Bright Orange) */}
      <mesh position={[0, 2.9, 0.5]} scale={[0.85, 0.9, 0.85]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ffedd5" /> 
      </mesh>
      <mesh position={[0, 2.6, 0.6]} scale={[0.7, 0.7, 0.7]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#fb923c" /> 
      </mesh>

      {/* --- HTML Hotspots --- */}
      
      {/* Brain - Top of Head */}
      <Html position={[0, 4.3, 0]} center zIndexRange={[100, 0]}>
        <PersonPartMarker id="brain" label="Neural Core" icon={BrainCircuit} colorClasses="bg-[#4ade80]" activePart={activePart} setActivePart={setActivePart} />
      </Html>

      {/* Glasses / Eyes */}
      <Html position={[0, 3.1, 1.3]} center zIndexRange={[100, 0]}>
        <PersonPartMarker id="glasses" label="Visionary Lens" icon={Glasses} colorClasses="bg-[#fb923c]" activePart={activePart} setActivePart={setActivePart} />
      </Html>

      {/* Lips / Mouth */}
      <Html position={[0, 2.5, 1.3]} center zIndexRange={[100, 0]}>
        <PersonPartMarker id="lips" label="Vocal Interface" icon={LipsIcon} colorClasses="bg-[#fcd34d]" activePart={activePart} setActivePart={setActivePart} />
      </Html>

      {/* Heart / Chest */}
      <Html position={[0.5, 1.2, 1.4]} center zIndexRange={[100, 0]}>
        <PersonPartMarker id="heart" label="Vital Engine" icon={Heart} colorClasses="bg-[#ec4899]" activePart={activePart} setActivePart={setActivePart} />
      </Html>

    </group>
  );
};

export default function AbstractPerson() {
  const [activePart, setActivePart] = useState<string | null>(null);

  return (
    // Background color matches the soft purplish blue of the thermal image reference
    <div className="relative w-full h-[100dvh] bg-[#6366f1] mx-auto flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden">
      
      {/* Global Style to blur ONLY the 3D Canvas, not the HTML overlay */}
      <style>{`
        .thermal-canvas canvas {
          /* Reduced blur from 40px to 20px so the shapes are more recognizable */
          filter: blur(20px) saturate(1.8) contrast(1.1) !important;
          transform: scale(1.05); /* Prevent blur edges from showing */
        }
      `}</style>

      <Canvas className="thermal-canvas z-10" camera={{ position: [0, 1.5, 9], fov: 45 }}>
        <ambientLight intensity={1} />
        
        <Suspense fallback={null}>
          <ThermalBust activePart={activePart} setActivePart={setActivePart} />
        </Suspense>
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          minPolarAngle={Math.PI / 3} 
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 3}
        />
      </Canvas>
      
      {/* Interaction Hint */}
      <div className="absolute bottom-6 text-center w-full text-white/50 text-xs tracking-widest uppercase pointer-events-none z-20 font-bold">
        드래그하여 형태 회전
      </div>
    </div>
  );
}
