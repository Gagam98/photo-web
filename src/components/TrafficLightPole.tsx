import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';

// Helper function to create a shape with rounded corners
const createRoundedShape = (shapeType: string) => {
  const shape = new THREE.Shape();
  if (shapeType === 'circle') {
    shape.absarc(0, 0, 1, 0, Math.PI * 2, false);
    return shape;
  }

  const sides = shapeType === 'triangle' ? 3 : 4;
  const radius = 1;
  const cornerRadius = 0.2; // ~20% rounding
  const angleOffset = shapeType === 'triangle' ? Math.PI / 2 : Math.PI / 4;

  const points = [];
  for (let i = 0; i < sides; i++) {
    const a = i * (Math.PI * 2) / sides + angleOffset;
    points.push(new THREE.Vector2(Math.cos(a) * radius, Math.sin(a) * radius));
  }

  let firstPt1 = null;
  for (let i = 0; i < sides; i++) {
    const pPrev = points[(i - 1 + sides) % sides];
    const p = points[i];
    const pNext = points[(i + 1) % sides];

    const vPrev = new THREE.Vector2().subVectors(pPrev, p).normalize();
    const vNext = new THREE.Vector2().subVectors(pNext, p).normalize();

    const pt1 = new THREE.Vector2().copy(p).add(vPrev.multiplyScalar(cornerRadius));
    const pt2 = new THREE.Vector2().copy(p).add(vNext.multiplyScalar(cornerRadius));

    if (i === 0) {
      firstPt1 = pt1;
      shape.moveTo(pt1.x, pt1.y);
    } else {
      shape.lineTo(pt1.x, pt1.y);
    }
    shape.quadraticCurveTo(p.x, p.y, pt2.x, pt2.y);
  }
  if (firstPt1) {
    shape.lineTo(firstPt1.x, firstPt1.y);
  }
  return shape;
};

const HudTooltip = ({ hovered, title, subtitle, actionText, position = [0, 0, 0], direction = 'right' }: any) => {
  return (
    <Html position={position} center zIndexRange={[100, 0]}>
      <div 
        className={`transition-all duration-500 pointer-events-none absolute top-1/2 -translate-y-1/2 ${
          direction === 'left' 
            ? `right-[120px] ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`
            : `left-[120px] ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`
        }`}
        style={{ width: '320px' }}
      >
        {/* Connecting Line from center of object to the box */}
        <div className={`absolute top-1/2 w-[120px] h-[1px] bg-white/40 -translate-y-1/2 ${
          direction === 'left' ? '-right-[120px]' : '-left-[120px]'
        }`} />
        
        {/* Main HUD Box */}
        <div className="relative border border-white/40 p-4 bg-black/10 backdrop-blur-sm text-white font-mono text-[11px] tracking-widest uppercase shadow-[0_0_30px_rgba(255,255,255,0.03)]">
          {/* Corner Markers (Crosshairs) */}
          <div className="absolute -top-[3px] -left-[3px] w-2 h-2 border-t-2 border-l-2 border-white" />
          <div className="absolute -top-[3px] -right-[3px] w-2 h-2 border-t-2 border-r-2 border-white" />
          <div className="absolute -bottom-[3px] -left-[3px] w-2 h-2 border-b-2 border-l-2 border-white" />
          <div className="absolute -bottom-[3px] -right-[3px] w-2 h-2 border-b-2 border-r-2 border-white" />
          
          {/* Top Header Row */}
          <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-2">
            <span className="opacity-60 text-[9px]">{title}</span>
            <span className="text-white font-bold">{subtitle}</span>
          </div>
          
          {/* Content Body */}
          <div className="flex flex-col gap-1.5 text-right">
            <span className="opacity-50 text-[9px] font-bold">ACTION REQUIRED</span>
            <span className="font-medium text-sm tracking-widest text-white">{actionText}</span>
          </div>
          
          {/* Subtle scanning/glitch overlay line */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-full w-full opacity-50 mix-blend-overlay pointer-events-none" />
        </div>
      </div>
    </Html>
  );
};

// Component for individual signs with physical backboards, inner borders, and solid-color silhouettes
const SolidSign = ({ textureUrl, position, boardRotation, scale, shape, bgColor, iconColor, iconScaleMultiplier = 1, title, subtitle, actionText, onClick, direction = 'right' }: any) => {
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(textureUrl) as THREE.Texture;
  
  const baseShape = React.useMemo(() => createRoundedShape(shape), [shape]);

  // Adjust scales for the inner layers based on the shape
  const borderScale = shape === 'circle' ? 0.93 : 0.90;
  const fillScale = shape === 'circle' ? 0.88 : 0.82;

  return (
    <group 
      position={position} 
      rotation={boardRotation} 
      scale={scale}
      onClick={onClick}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); if (onClick) document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); if (onClick) document.body.style.cursor = 'default'; }}
    >
      
      {/* 3D Base Sign Board (Outer Color) */}
      <mesh position={[0, 0, -0.04]}>
        <extrudeGeometry args={[baseShape, { depth: 0.04, bevelEnabled: false }]} />
        <meshStandardMaterial color={bgColor} roughness={0.6} />
      </mesh>

      {/* Inner Border (Icon Color) - Flat plane slightly in front of base */}
      <mesh position={[0, 0, 0.005]} scale={[borderScale, borderScale, 1]}>
        <shapeGeometry args={[baseShape]} />
        <meshStandardMaterial color={iconColor} roughness={0.6} />
      </mesh>

      {/* Inner Fill (Base Color) - Flat plane slightly in front of border */}
      <mesh position={[0, 0, 0.01]} scale={[fillScale, fillScale, 1]}>
        <shapeGeometry args={[baseShape]} />
        <meshStandardMaterial color={bgColor} roughness={0.6} />
      </mesh>

      {/* The solid-color icon silhouette layered on top */}
      <mesh position={[0, 0, 0.015]} scale={shape === 'circle' ? [1.2 * iconScaleMultiplier, 1.2 * iconScaleMultiplier, 1] : [0.9 * iconScaleMultiplier, 0.9 * iconScaleMultiplier, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial 
          color={iconColor}
          alphaMap={texture} 
          transparent={true}
          alphaTest={0.05} // Cuts off the dark background
          depthWrite={false}
        />
      </mesh>

      {/* HUD Tooltip for the sign */}
      <HudTooltip 
        hovered={hovered} 
        title={title} 
        subtitle={subtitle} 
        actionText={actionText}
        position={[0, 0, 0]} // Positioned exactly at the sign center
        direction={direction}
      />

    </group>
  );
};

// Component for the Food Traffic Light
const FoodTrafficLight = ({ position, rotation, scale = [1, 1, 1], onClick, direction = 'right' }: any) => {
  const [hovered, setHovered] = useState(false);
  const tomatoTex = useTexture('/tomato_slice.png');
  const lemonTex = useTexture('/lemon_slice.png');
  const limeTex = useTexture('/lime_slice.png');

  // Traffic Light Housing
  const housingMaterial = <meshStandardMaterial color="#eab308" roughness={0.3} metalness={0.2} />; 

  // Thick hat-like hood shape
  const hoodShape = React.useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 0.52, 0, Math.PI, false); 
    shape.absarc(0, 0, 0.46, Math.PI, 0, true); 
    return shape;
  }, []);

  const hoodMaterial = <meshStandardMaterial color="#111" roughness={0.8} />;

  return (
    <group 
      position={position} 
      rotation={rotation} 
      scale={scale} 
      onClick={onClick}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); if (onClick) document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); if (onClick) document.body.style.cursor = 'default'; }}
    >
      
      {/* Main Yellow Box (Rounded) */}
      <RoundedBox args={[1.2, 3.6, 0.3]} radius={0.15} smoothness={2} position={[0, 0, 0]}>
        {housingMaterial}
      </RoundedBox>

      {/* Red Light (Tomato) */}
      <group position={[0, 1.2, 0.16]}>
        <mesh position={[0, 0, 0.05]}>
          <circleGeometry args={[0.45, 32]} />
          <meshBasicMaterial map={tomatoTex} />
        </mesh>
        {/* Thick Black Hood */}
        <mesh position={[0, 0, 0]}>
          <extrudeGeometry args={[hoodShape, { depth: 0.45, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.01, bevelThickness: 0.01 }]} />
          {hoodMaterial}
        </mesh>
      </group>

      {/* Yellow Light (Lemon) */}
      <group position={[0, 0, 0.16]}>
        <mesh position={[0, 0, 0.05]}>
          <circleGeometry args={[0.45, 32]} />
          <meshBasicMaterial map={lemonTex} />
        </mesh>
        {/* Thick Black Hood */}
        <mesh position={[0, 0, 0]}>
          <extrudeGeometry args={[hoodShape, { depth: 0.45, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.01, bevelThickness: 0.01 }]} />
          {hoodMaterial}
        </mesh>
      </group>

      {/* Green Light (Lime) */}
      <group position={[0, -1.2, 0.16]}>
        <mesh position={[0, 0, 0.05]}>
          <circleGeometry args={[0.45, 32]} />
          <meshBasicMaterial map={limeTex} />
        </mesh>
        {/* Thick Black Hood */}
        <mesh position={[0, 0, 0]}>
          <extrudeGeometry args={[hoodShape, { depth: 0.45, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.01, bevelThickness: 0.01 }]} />
          {hoodMaterial}
        </mesh>
      </group>
      
      {/* HUD Tooltip overlay (Stripe BFCM Style) */}
      <HudTooltip 
        hovered={hovered}
        title="MODULE 01"
        subtitle="FOOD CAROUSEL"
        actionText="CLICK TO VIEW GALLERY"
        position={[0, 0, 0]} // Positioned exactly at the center of the traffic light
        direction={direction}
      />

    </group>
  );
};

export default function TrafficLightPole({ onLightClick, onMemoryClick }: { onLightClick?: () => void, onMemoryClick?: () => void }) {
  const poleRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (poleRef.current) {
      poleRef.current.position.y = Math.sin(t * 0.8) * 0.1 - 1;
      // Rotate the pole base slightly so the 45-degree gathered signs are perfectly centered in the camera
      poleRef.current.rotation.y = Math.sin(t * 0.3) * 0.2 - Math.PI / 8;
    }
  });

  return (
    <group ref={poleRef}>
      
      {/* Central Pole */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 12, 32]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Food Traffic Light - Left side embedded into the pole, facing RIGHT (+X) */}
      <FoodTrafficLight 
        position={[0.33, 1.7, -0.7]} 
        rotation={[0, Math.PI / 2, 0]} 
        scale={[1.2, 1.2, 1.2]} 
        onClick={(e: any) => {
          e.stopPropagation();
          onLightClick?.();
        }}
      />

      {/* LEFT SIGNS ASSEMBLY - Rotated 45 degrees inward to gather them (inner angle 45, outer 135) */}
      <group rotation={[0, Math.PI / 4, 0]}>
        {/* ㄷ-Shape Bracket */}
        <group position={[0, 0, 0]}>
          {/* Top horizontal */}
          <mesh position={[-0.8, 4.0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 1.6]} />
            <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
          </mesh>
          
          {/* Vertical */}
          <mesh position={[-1.6, 1.5, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 5.0]} />
            <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
          </mesh>
          
          {/* Bottom horizontal - lowered to extend the pipe below the orange sign */}
          <mesh position={[-0.8, -1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 1.6]} />
            <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
          </mesh>
          
          {/* Joints */}
          <mesh position={[-1.6, 4.0, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[-1.6, -1.0, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* Museum Sign (Pensive Bodhisattva) */}
        <SolidSign 
          textureUrl="/bodhisattva_sign.png" 
          position={[-1.6, 2.7, 0.06]} 
          boardRotation={[0, 0, 0]} 
          scale={[1.2, 1.2, 1]} 
          shape="circle"
          bgColor="#2563eb"
          iconColor="#ffffff"
          iconScaleMultiplier={1.3}
          title="MODULE 02"
          subtitle="MUSEUM ARTIFACT"
          actionText="COMING SOON"
          onClick={(e: any) => { e.stopPropagation(); /* onMuseumClick */ }}
          direction="left"
        />

        {/* Memory Sign (Brain) */}
        <SolidSign 
          textureUrl="/brain_sign.png" 
          position={[-1.6, 0.1, 0.06]} 
          boardRotation={[0, 0, 0]} 
          scale={[1.3, 1.3, 1]} 
          shape="triangle"
          bgColor="#f97316"
          iconColor="#000000"
          title="MODULE 03"
          subtitle="MEMORY ARCHIVE"
          actionText="CLICK TO VIEW GALLERY"
          onClick={(e: any) => { e.stopPropagation(); onMemoryClick?.(); }}
          direction="left"
        />
      </group>

      {/* Game Sign (Pro Controller) - Flush against the RIGHT side of the pole, moved higher, facing RIGHT (+X) */}
      <SolidSign 
        textureUrl="/procon_sign.png" 
        position={[0.22, -1.5, 0]} 
        boardRotation={[0, Math.PI / 2, 0]} 
        scale={[1.4, 1.4, 1]} 
        shape="diamond"
        bgColor="#16a34a"
        iconColor="#ffffff"
        title="MODULE 04"
        subtitle="GAMING HUD"
        actionText="COMING SOON"
        onClick={(e: any) => { e.stopPropagation(); /* onGameClick */ }}
      />

    </group>
  );
}
