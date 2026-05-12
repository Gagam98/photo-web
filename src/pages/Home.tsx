import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// --- 3D Components ---

// 1. CD Component
const CD = ({ position, rotation, textureUrl, index, selectedCD, onSelect, isPlaying }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Use React Three Fiber's built-in texture loader which works perfectly with local images
  const texture = useTexture(textureUrl) as THREE.Texture;
  texture.colorSpace = THREE.SRGBColorSpace;

  const isSelected = selectedCD === index;

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    if (isSelected) {
      // 1. Move to the front of the player (Player is at x=2.5, y=0)
      gsap.to(group.position, {
        x: 2.5,
        y: 0,
        z: 1.5, // Float in front of the player
        duration: 0.8,
        ease: "power2.inOut",
      });
      // Flatten CD (Facing the camera)
      gsap.to(group.rotation, {
        x: Math.PI / 2,
        y: 0,
        z: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          // 2. Drop into player slot
          gsap.to(group.position, {
            z: 0.15, // Insert into player
            duration: 0.6,
            ease: "power2.in",
          });
        }
      });
    } else {
      // Return to original slot
      gsap.to(group.position, {
        x: position[0],
        y: position[1],
        z: position[2],
        duration: 1.2,
        ease: "power3.out",
        delay: selectedCD !== null ? 0.3 : 0 // Wait a bit if another CD was selected
      });
      gsap.to(group.rotation, {
        x: rotation[0],
        y: rotation[1],
        z: rotation[2],
        duration: 1.2,
        ease: "power3.out",
        delay: selectedCD !== null ? 0.3 : 0
      });
    }
  }, [isSelected, selectedCD, position[0], position[1], position[2], rotation[0], rotation[1], rotation[2]]);

  // Spinning animation when inside player
  useFrame(() => {
    if (groupRef.current) {
      if (isSelected && isPlaying && groupRef.current.position.z <= 0.2) {
        groupRef.current.rotation.y -= 0.08;
      }
    }
  });

  return (
    <group 
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(isSelected ? null : index);
      }}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'default'}
    >
      {/* Outer Cylinder (The CD) */}
      <mesh>
        <cylinderGeometry args={[1.5, 1.5, 0.05, 64]} />
        <meshStandardMaterial attach="material-0" color="#222" />
        {/* Use meshBasicMaterial for the printed face so lighting doesn't make it look dark/gray */}
        <meshBasicMaterial 
          attach="material-1" 
          map={texture} 
          color="white" 
        />
        <meshStandardMaterial attach="material-2" color="#e0e0e0" roughness={0.1} metalness={0.8} />
      </mesh>
      {/* Inner Hole (Visual hack: dark cylinder that hides the center) */}
      <mesh position={[0, 0.001, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.06, 32]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      {/* Plastic Ring in center */}
      <mesh position={[0, 0.002, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.055, 32]} />
        <meshStandardMaterial color="#fff" transparent opacity={0.3} roughness={0.1} />
      </mesh>
    </group>
  );
};

// 2. CD Player Component (Vertical, Wall-mounted style)
const CDPlayer = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Main Vertical Body - Light Gray (Classic MUJI style) */}
      <mesh position={[0, 0, -0.25]}>
        <boxGeometry args={[4.2, 4.2, 0.5]} />
        <meshStandardMaterial color="#b0b0b0" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* CD Mount / Indentation on the front face - Slightly darker gray */}
      <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.6, 1.6, 0.05, 64]} />
        <meshStandardMaterial color="#888888" roughness={0.9} />
      </mesh>
      {/* Buttons on the vertical player */}
      <mesh position={[-1.5, -1.8, 0.01]}>
        <circleGeometry args={[0.1, 16]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      <mesh position={[-1.1, -1.8, 0.01]}>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
    </group>
  );
};

// 3. Scene Container
const Scene = ({ selectedCD, setSelectedCD, tracks, isPlaying }: any) => {
  return (
    <>
      <ambientLight intensity={1.2} />
      <spotLight position={[0, 10, 5]} intensity={2} penumbra={1} angle={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />

      {/* Vertical Player positioned on the right */}
      <group position={[2.5, 0, 0]}>
        <CDPlayer />
      </group>

      {/* Render CDs stacked vertically on the left */}
      {tracks.map((track: any, i: number) => (
        <CD 
          key={track.id}
          index={i}
          selectedCD={selectedCD}
          onSelect={setSelectedCD}
          textureUrl={track.image}
          isPlaying={isPlaying}
          // Stacked vertically on the left, adjusted spacing to fit 4 CDs
          position={[-2.5, 3 - i * 2, 0]}
          // Standing up vertically (facing front), tilted very slightly back
          rotation={[Math.PI / 2.2, 0, 0]}
        />
      ))}

      {/* Floor shadow */}
      <ContactShadows position={[0, -3.6, 0]} opacity={0.4} scale={20} blur={2.5} far={5} />
      
      {/* OrbitControls */}
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 1.8}
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 6}
        minDistance={7}
        maxDistance={14}
      />
    </>
  );
};

// --- Main Page Component ---
export default function Home() {
  const [selectedCD, setSelectedCD] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Use reliable local images downloaded to the public folder
  const tracks = [
    { id: 1, title: 'Neon Nights', artist: 'Synthwave City', image: '/cd1.jpg' },
    { id: 2, title: 'Vinyl Dreams', artist: 'Analog Soul', image: '/cd2.jpg' },
    { id: 3, title: 'Live Energy', artist: 'The Crowd', image: '/cd3.jpg' },
    { id: 4, title: 'Deep Focus', artist: 'Lofi Beats', image: '/cd4.jpg' },
  ];

  // Auto-play when CD is inserted (after animation delay)
  useEffect(() => {
    if (selectedCD !== null) {
      const timer = setTimeout(() => setIsPlaying(true), 1500); // Wait for drop animation
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
    }
  }, [selectedCD]);

  return (
    <div className="w-full h-[100dvh] bg-[#0a0a0a] overflow-hidden relative font-sans">
      
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing">
        {/* Adjusted camera for the Left/Right layout */}
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <Suspense fallback={null}>
            <Scene selectedCD={selectedCD} setSelectedCD={setSelectedCD} tracks={tracks} isPlaying={isPlaying} />
          </Suspense>
        </Canvas>
      </div>

      {/* 2D Overlay UI (Titles, Instructions) */}
      <div className="absolute top-8 left-0 right-0 flex justify-center z-10 pointer-events-none">
        <div className="text-center">
          <h1 className="text-white text-3xl md:text-5xl font-black tracking-tighter drop-shadow-xl">Virtual CD Player</h1>
          <p className="text-zinc-400 mt-2 text-sm uppercase tracking-widest font-medium bg-black/40 px-4 py-1 rounded-full inline-block backdrop-blur-sm">
            드래그하여 화면 회전 • CD를 클릭하여 재생
          </p>
        </div>
      </div>



    </div>
  );
}
