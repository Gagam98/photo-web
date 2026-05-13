import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Image, ScrollControls, useScroll } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

const baseCardsData = [
  { url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800', title: 'MEM-01' },
  { url: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?q=80&w=800', title: 'MEM-02' },
  { url: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=800', title: 'MEM-03' },
  { url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800', title: 'MEM-04' },
  { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800', title: 'MEM-05' },
  { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800', title: 'MEM-06' },
  { url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800', title: 'MEM-07' },
  { url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=800', title: 'MEM-08' },
];

const CARD_WIDTH = 4;
const CARD_HEIGHT = 5.5;

const MemoryCard = ({ url, index, totalCards }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  
  useFrame(() => {
    if (!groupRef.current) return;
    
    // 무한 루프 래핑
    const scrollOffset = scroll.offset;
    let p = (index / totalCards) - scrollOffset;
    p = p - Math.floor(p);
    
    // 시작: 왼쪽 아래 (p=0일 때 X=-16, Y=-16)
    // 끝: 오른쪽 위 (p=1일 때 X=34, Y=34)
    const targetX = p * 50 - 16;
    const targetY = p * 50 - 16;
    const targetZ = -p * 40 + 5; 
    
    // 사진이 원본과 동일하게 아주 살짝만 왼쪽을 바라보도록 얕은 각도(-Math.PI / 16) 적용
    const targetRotationY = -Math.PI / 16;
    
    groupRef.current.position.set(targetX, targetY, targetZ);
    groupRef.current.rotation.y = targetRotationY;
  });

  return (
    <group ref={groupRef}>
      {/* 화이트 패널 (사진 두께/테두리 효과) */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[CARD_WIDTH + 0.1, CARD_HEIGHT + 0.1]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* 선명한 원본 이미지 */}
      <Image 
        url={url} 
        scale={[CARD_WIDTH, CARD_HEIGHT]} 
        position={[0, 0, 0]} 
      />
    </group>
  );
};

const Scene = () => {
  // 카드 간격을 25% 더 넓히기 위해 24장(3세트)으로 조절
  const cardsData = useMemo(() => Array(3).fill(baseCardsData).flat(), []);

  return (
    <ScrollControls pages={5} infinite damping={0.1} distance={1}>
      {cardsData.map((data, i) => (
        <MemoryCard 
          key={i} 
          {...data} 
          index={i} 
          totalCards={cardsData.length}
        />
      ))}
    </ScrollControls>
  );
};

export default function MemoryArchive() {
  const navigate = useNavigate();
  
  return (
    <div className="relative w-full h-[100dvh] bg-[#f4f4f5] overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} className="z-10" dpr={[1, 2]}>
        <ambientLight intensity={1} />
        <Scene />
      </Canvas>
      
      <div className="absolute top-8 left-8 z-20">
        <button 
          onClick={() => navigate('/')} 
          className="px-6 py-2 border border-black/20 rounded-full text-black/60 hover:text-black hover:border-black transition-colors font-mono text-sm tracking-widest uppercase bg-white/50 backdrop-blur-md"
        >
          ← Back to Hub
        </button>
      </div>
      
      {/* 오른쪽 상단의 불필요한 로고 영역 완전 제거 */}
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-black/40 tracking-widest text-xs font-mono uppercase pointer-events-none">
        Scroll to explore
      </div>
    </div>
  );
}
