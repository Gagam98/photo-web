import { useRef, useMemo, useState } from 'react';
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

const MemoryCard = ({ url, index, totalCards, activeCard, setActiveCard }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const isActive = activeCard === index;
  
  const prevP = useRef<number>(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // 무한 루프 래핑 (기본 스크롤 궤도 계산)
    const scrollOffset = scroll.offset;
    let p = (index / totalCards) - scrollOffset;
    p = p - Math.floor(p);
    
    // p값이 0과 1 사이를 점프할 때(루프될 때) 댐핑에 의해 거꾸로 날아가는 현상 방지
    const isWrapAround = Math.abs(p - prevP.current) > 0.5;
    prevP.current = p;
    
    const normalX = p * 50 - 16;
    const normalY = p * 50 - 16;
    const normalZ = -p * 40 + 5; 
    const normalRotY = -Math.PI / 16;
    
    // 확대(Zoom) 상태일 때의 타겟 좌표 (너무 크게 확대되지 않도록 Z=0으로 조정)
    const targetX = isActive ? 0 : normalX;
    const targetY = isActive ? 0 : normalY;
    const targetZ = isActive ? 0 : normalZ;
    const targetRotY = isActive ? 0 : normalRotY;
    
    // 다른 카드가 확대되었을 때 현재 카드를 숨기기 위한 스케일 처리
    const isOtherCardActive = activeCard !== null && !isActive;
    const targetScale = isOtherCardActive ? 0 : 1;
    
    if (isWrapAround && activeCard === null) {
      // 스크롤 루프 발생 시 순간이동 처리 (날아가는 애니메이션 방지)
      groupRef.current.position.set(targetX, targetY, targetZ);
      groupRef.current.rotation.y = targetRotY;
      groupRef.current.scale.setScalar(targetScale);
    } else {
      // 부드러운 위치/회전/스케일 보간 (Damping)
      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, 5, delta);
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY, 5, delta);
      groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, targetZ, 5, delta);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 5, delta);
      
      const newScale = THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 5, delta);
      groupRef.current.scale.setScalar(newScale);
    }
  });

  return (
    <group 
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        setActiveCard(isActive ? null : index);
      }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
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
  const [activeCard, setActiveCard] = useState<number | null>(null);

  return (
    <group onPointerMissed={() => setActiveCard(null)}>
      <ScrollControls pages={5} infinite damping={0.1} distance={1}>
        {cardsData.map((data, i) => (
          <MemoryCard 
            key={i} 
            {...data} 
            index={i} 
            totalCards={cardsData.length}
            activeCard={activeCard}
            setActiveCard={setActiveCard}
          />
        ))}
      </ScrollControls>
    </group>
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
