import { useRef, useMemo, useState, useEffect, Suspense, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Image, ScrollControls, useScroll } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import * as THREE from 'three';

const CARD_WIDTH = 4;
const CARD_HEIGHT = 5.5;

class CardErrorBoundary extends Component<any, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
      );
    }
    return this.props.children;
  }
}

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


const CardLoadingPlaceholder = () => (
  <mesh position={[0, 0, 0]}>
    <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
    <meshBasicMaterial color="#e4e4e7" />
  </mesh>
);

const MemoryCard = ({ index, totalCards, activeCard, setActiveCard, photos }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const isActive = activeCard === index;
  
  const prevP = useRef<number>(0);
  const prevScrollOffset = useRef<number>(0);
  const wrapCounter = useRef<number>(0);
  
  const [photoIndex, setPhotoIndex] = useState(() => {
    if (!photos || photos.length === 0) return 0;
    return index % photos.length;
  });

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // Infinite loop wrapping (calculate scroll coordinates)
    const scrollOffset = scroll.offset;
    
    // Track continuous scroll wrap arounds to support infinitely advancing photo indices
    const diff = scrollOffset - prevScrollOffset.current;
    if (diff < -0.5) {
      wrapCounter.current += 1;
    } else if (diff > 0.5) {
      wrapCounter.current -= 1;
    }
    prevScrollOffset.current = scrollOffset;

    const absoluteOffset = scrollOffset + wrapCounter.current;
    
    let p = (index / totalCards) - absoluteOffset;
    const floorValue = Math.floor(p);
    p = p - floorValue;
    
    // Dynamically calculate and swap photo index when card wraps off-screen
    if (photos && photos.length > 0) {
      let targetIdx = (index - floorValue * totalCards) % photos.length;
      if (targetIdx < 0) targetIdx += photos.length;
      if (targetIdx !== photoIndex) {
        setPhotoIndex(targetIdx);
      }
    }

    // Prevent reverse flying animations during loop resets
    const isWrapAround = Math.abs(p - prevP.current) > 0.5;
    prevP.current = p;
    
    const normalX = p * 50 - 16;
    const normalY = p * 50 - 16;
    const normalZ = -p * 40 + 5; 
    const normalRotY = -Math.PI / 16;
    
    // Zoom target coordinate adjustments
    const targetX = isActive ? 0 : normalX;
    const targetY = isActive ? 0 : normalY;
    const targetZ = isActive ? 0 : normalZ;
    const targetRotY = isActive ? 0 : normalRotY;
    
    // Hide other cards when one is focused
    const isOtherCardActive = activeCard !== null && !isActive;
    const targetScale = isOtherCardActive ? 0 : 1;
    
    if (isWrapAround && activeCard === null) {
      groupRef.current.position.set(targetX, targetY, targetZ);
      groupRef.current.rotation.y = targetRotY;
      groupRef.current.scale.setScalar(targetScale);
    } else {
      // Smooth coordinate interpolation (Damping)
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
      {/* White Panel (Card border/thickness look) */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[CARD_WIDTH + 0.1, CARD_HEIGHT + 0.1]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Clear Image Rendering with Error Boundary and loading fallback */}
      <CardErrorBoundary>
        <Suspense fallback={<CardLoadingPlaceholder />}>
          {photos && photos[photoIndex] && (
            <Image 
              url={photos[photoIndex].url} 
              scale={[CARD_WIDTH, CARD_HEIGHT]} 
              position={[0, 0, 0]} 
            />
          )}
        </Suspense>
      </CardErrorBoundary>
    </group>
  );
};

const ScrollControllerHelper = ({ 
  onVelocityChange,
  isPaused 
}: { 
  onVelocityChange: (vel: number) => void;
  isPaused: boolean;
}) => {
  const scroll = useScroll() as any;
  const prevTarget = useRef(0);
  
  // Disable macOS overscroll rubber-banding once the scroll element mounts.
  // This ensures that scroll.scrollTop hits 0 or maxScroll exactly without negative bouncing,
  // making Drei's infinite scroll wrap-around trigger smoothly and perfectly in both directions!
  useEffect(() => {
    const el = scroll.el;
    if (el) {
      el.style.overscrollBehavior = 'none';
      el.style.scrollBehavior = 'auto';
    }
  }, [scroll]);

  useFrame((_, delta) => {
    // 1. Auto-scroll: advance Drei's internal target scroll reference directly ONLY if not paused
    if (!isPaused) {
      const AUTO_SCROLL_SPEED = 0.02; // 0.02 units per second (gentle and elegant panning)
      scroll.scroll.current += AUTO_SCROLL_SPEED * delta;
    }
    
    // 2. Calculate velocity using the unwrapped scroll.scroll.current target
    // to prevent any wrap-around speed spikes when the loop wraps.
    const currentTarget = scroll.scroll.current;
    const diff = currentTarget - prevTarget.current;
    
    const computedVelocity = delta > 0 ? diff / delta : 0;
    prevTarget.current = currentTarget;
    
    onVelocityChange(computedVelocity);
  });
  
  return null;
};

const Scene = ({ 
  photos, 
  onVelocityChange,
  activeCard,
  setActiveCard
}: { 
  photos: any[], 
  onVelocityChange: (vel: number) => void,
  activeCard: number | null,
  setActiveCard: (val: number | null) => void
}) => {
  // Shuffle all photos once on mount to provide a fresh experience without duplicates
  const shuffledPhotos = useMemo(() => {
    if (!photos || photos.length === 0) return [];
    return [...photos].sort(() => Math.random() - 0.5);
  }, [photos]);

  const cardsData = useMemo(() => {
    // Exactly 24 slot positions in the virtualized 3D space
    return Array(24).fill({});
  }, []);

  return (
    <group onPointerMissed={() => setActiveCard(null)}>
      <ScrollControls 
        pages={6} 
        infinite 
        damping={0.1} 
        distance={1}
      >
        <ScrollControllerHelper onVelocityChange={onVelocityChange} isPaused={activeCard !== null} />
        {cardsData.map((_, i) => (
          <MemoryCard 
            key={i} 
            index={i} 
            totalCards={24}
            activeCard={activeCard}
            setActiveCard={setActiveCard}
            photos={shuffledPhotos}
          />
        ))}
      </ScrollControls>
    </group>
  );
};

export default function MemoryArchive() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true); // Manages loading screen unmounting
  const [isRunning, setIsRunning] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null); // Hoisted zoom state
  const pictogramRef = useRef<HTMLDivElement>(null);
  const smoothedVelocity = useRef(0);

  // DOM Refs to update preloading progress directly without triggering React re-renders (prevents stickman lag!)
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);

  // Dynamically inject a global style sheet on mount to completely hide all browser scrollbars,
  // then cleanly remove it when the component unmounts to restore standard browser behavior!
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'hide-scrollbar-global-style';
    style.innerHTML = `
      /* Completely hide all vertical and horizontal scrollbars globally while this route is active */
      ::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      * {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existing = document.getElementById('hide-scrollbar-global-style');
      if (existing) {
        existing.remove();
      }
    };
  }, []);

  // Fetch photos from manifest & pre-cache
  useEffect(() => {
    fetch('/manifests/Memory.json')
      .then(res => res.json())
      .then(data => {
        const rawPhotos = (data.images && data.images.length > 0) ? data.images : baseCardsData;
        setPhotos(rawPhotos);
        
        const urlsToPreload = rawPhotos.slice(0, 200).map((p: any) => p.url);
        if (urlsToPreload.length === 0) {
          if (progressBarRef.current) progressBarRef.current.style.width = '100%';
          if (progressTextRef.current) progressTextRef.current.innerText = 'LOADING 100%';
          setIsLoading(false);
          return;
        }

        // We only wait for the first 12 images to load to unblock the UI instantly
        const INITIAL_BATCH_SIZE = Math.min(12, urlsToPreload.length);
        const initialBatch = urlsToPreload.slice(0, INITIAL_BATCH_SIZE);
        const backgroundBatch = urlsToPreload.slice(INITIAL_BATCH_SIZE);

        let loadedCount = 0;

        const updateProgressDOM = (count: number, total: number) => {
          const percent = Math.round((count / total) * 100);
          if (progressBarRef.current) progressBarRef.current.style.width = `${percent}%`;
          if (progressTextRef.current) progressTextRef.current.innerText = `LOADING ${percent}%`;
        };

        // 1. Fast Initial Batch
        initialBatch.forEach((url: string) => {
          const img = new window.Image();
          img.src = url;
          
          // Use decode() to move image decoding off the main thread to prevent CPU locking!
          img.decode().then(() => {
            loadedCount++;
            updateProgressDOM(loadedCount, INITIAL_BATCH_SIZE);
            
            if (loadedCount === INITIAL_BATCH_SIZE) {
              // Smoothly fade out loader screen
              setTimeout(() => {
                setIsLoading(false);
              }, 500);
              
              // 2. Start Silent Background Chunk Loading for the remaining images
              if (backgroundBatch.length > 0) {
                // Wait 1.5 seconds before starting background load to let 3D scene stabilize
                setTimeout(() => {
                  loadInBackground(backgroundBatch);
                }, 1500);
              }
            }
          }).catch(() => {
            loadedCount++;
            updateProgressDOM(loadedCount, INITIAL_BATCH_SIZE);
            if (loadedCount === INITIAL_BATCH_SIZE) {
              setTimeout(() => { setIsLoading(false); }, 500);
            }
          });
        });

        // Silent background worker
        const loadInBackground = async (urls: string[]) => {
          const CHUNK_SIZE = 5; // Load 5 images at a time to prevent saturating the network/CPU
          for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
            const chunk = urls.slice(i, i + CHUNK_SIZE);
            await Promise.all(chunk.map(url => {
              const img = new window.Image();
              img.src = url;
              return img.decode().catch(() => {});
            }));
            // Slight pause between chunks to let the main thread process scrolling events without stutter
            await new Promise(res => setTimeout(res, 200));
          }
        };

      })
      .catch(err => {
        console.error('Failed to load Memory manifest', err);
        setPhotos(baseCardsData);
        if (progressBarRef.current) progressBarRef.current.style.width = '100%';
        if (progressTextRef.current) progressTextRef.current.innerText = 'LOADING 100%';
        setIsLoading(false);
      });
  }, []);

  // Unmount loader overlay 1s after opacity transition completes
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleVelocityChange = (vel: number) => {
    // Smooth the velocity to prevent sudden animation jumps
    smoothedVelocity.current = THREE.MathUtils.damp(smoothedVelocity.current, vel, 8, 0.016);
    
    const absVel = Math.abs(smoothedVelocity.current);
    const threshold = 0.15; // Speed threshold to switch from walking to running
    
    if (absVel >= threshold) {
      if (!isRunning) setIsRunning(true);
      
      // Speed up animation duration based on velocity
      // Running duration goes from 0.45s down to 0.32s max (sprint limit)
      if (pictogramRef.current) {
        const duration = Math.max(0.32, 0.45 - (absVel - threshold) * 0.5);
        pictogramRef.current.style.setProperty('--speed-scale', `${duration}s`);
      }
    } else {
      if (isRunning) setIsRunning(false);
      
      // Walking: fixed peaceful walk speed
      if (pictogramRef.current) {
        pictogramRef.current.style.setProperty('--speed-scale', '1.2s');
      }
    }
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#f4f4f5] overflow-hidden">
      {/* Master Gait Stylesheet - Shared by both background and loader stickmen to prevent tilt anomalies */}
      <style>{`
        /* === Walking Gait Keyframes === */
        @keyframes walking-thigh-left {
          0%, 100% { transform: rotate(-40deg); }
          50% { transform: rotate(30deg); }
        }
        @keyframes walking-thigh-right {
          0%, 100% { transform: rotate(30deg); }
          50% { transform: rotate(-40deg); }
        }
        @keyframes walking-calf-left {
          0%, 100% { transform: rotate(0deg); }   
          25% { transform: rotate(5deg); }       
          50% { transform: rotate(35deg); }       
          75% { transform: rotate(15deg); }       
        }
        @keyframes walking-calf-right {
          0%, 100% { transform: rotate(35deg); }
          25% { transform: rotate(15deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(5deg); }
        }
        @keyframes walking-arm-left {
          0%, 100% { transform: rotate(35deg); }
          50% { transform: rotate(-35deg); }
        }
        @keyframes walking-arm-right {
          0%, 100% { transform: rotate(-35deg); }
          50% { transform: rotate(35deg); }
        }
        @keyframes walking-body-bounce {
          0%, 100% { transform: translateY(0); }
          25%, 75% { transform: translateY(-3px); }
        }
        
        /* === Running Gait Keyframes === */
        @keyframes running-thigh-left {
          0%, 100% { transform: rotate(-75deg); }
          50% { transform: rotate(50deg); }
        }
        @keyframes running-thigh-right {
          0%, 100% { transform: rotate(50deg); }
          50% { transform: rotate(-75deg); }
        }
        @keyframes running-calf-left {
          0%, 100% { transform: rotate(85deg); }  
          25% { transform: rotate(20deg); }       
          50% { transform: rotate(0deg); }        
          75% { transform: rotate(40deg); }       
        }
        @keyframes running-calf-right {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(40deg); }
          50% { transform: rotate(85deg); }
          75% { transform: rotate(20deg); }
        }
        @keyframes running-arm-left {
          0%, 100% { transform: rotate(65deg); }
          50% { transform: rotate(-65deg); }
        }
        @keyframes running-arm-right {
          0%, 100% { transform: rotate(-65deg); }
          50% { transform: rotate(65deg); }
        }
        @keyframes running-body-bounce {
          0%, 100% { transform: rotate(8deg) translateY(0); }
          25%, 75% { transform: rotate(8deg) translateY(-8px); }
        }

        /* === Active classes based on State Machine === */
        .gait-walking .animate-thigh-left {
          animation: walking-thigh-left var(--speed-scale, 1.2s) infinite ease-in-out;
        }
        .gait-walking .animate-thigh-right {
          animation: walking-thigh-right var(--speed-scale, 1.2s) infinite ease-in-out;
        }
        .gait-walking .animate-calf-left {
          animation: walking-calf-left var(--speed-scale, 1.2s) infinite ease-in-out;
        }
        .gait-walking .animate-calf-right {
          animation: walking-calf-right var(--speed-scale, 1.2s) infinite ease-in-out;
        }
        .gait-walking .animate-arm-left {
          animation: walking-arm-left var(--speed-scale, 1.2s) infinite ease-in-out;
        }
        .gait-walking .animate-arm-right {
          animation: walking-arm-right var(--speed-scale, 1.2s) infinite ease-in-out;
        }
        .gait-walking .animate-body {
          animation: walking-body-bounce var(--speed-scale, 1.2s) infinite ease-in-out;
          transform-origin: 50px 54px;
        }

        /* === Paused Gait state: Override to static wide-legged cross pose === */
        .gait-paused .animate-thigh-left {
          animation: none !important;
          transform: rotate(-40deg) !important;
        }
        .gait-paused .animate-thigh-right {
          animation: none !important;
          transform: rotate(30deg) !important;
        }
        .gait-paused .animate-calf-left {
          animation: none !important;
          transform: rotate(0deg) !important;
        }
        .gait-paused .animate-calf-right {
          animation: none !important;
          transform: rotate(35deg) !important;
        }
        .gait-paused .animate-arm-left {
          animation: none !important;
          transform: rotate(35deg) !important;
        }
        .gait-paused .animate-arm-right {
          animation: none !important;
          transform: rotate(-35deg) !important;
        }
        .gait-paused .animate-body {
          animation: none !important;
          transform-origin: 50px 54px !important;
          transform: rotate(0deg) translateY(0) !important;
        }

        .gait-running .animate-thigh-left {
          animation: running-thigh-left var(--speed-scale, 0.35s) infinite ease-in-out;
        }
        .gait-running .animate-thigh-right {
          animation: running-thigh-right var(--speed-scale, 0.35s) infinite ease-in-out;
        }
        .gait-running .animate-calf-left {
          animation: running-calf-left var(--speed-scale, 0.35s) infinite ease-in-out;
        }
        .gait-running .animate-calf-right {
          animation: running-calf-right var(--speed-scale, 0.35s) infinite ease-in-out;
        }
        .gait-running .animate-arm-left {
          animation: running-arm-left var(--speed-scale, 0.35s) infinite ease-in-out;
        }
        .gait-running .animate-arm-right {
          animation: running-arm-right var(--speed-scale, 0.35s) infinite ease-in-out;
        }
        .gait-running .animate-body {
          animation: running-body-bounce var(--speed-scale, 0.35s) infinite ease-in-out;
          transform-origin: 50px 54px;
        }

      `}</style>

      {/* 3D Scene always mounted underneath to render, load, and auto-scroll in background */}
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} className="z-10" dpr={[1, 2]}>
        <ambientLight intensity={1} />
        <Suspense fallback={null}>
          <Scene 
            photos={photos} 
            onVelocityChange={handleVelocityChange} 
            activeCard={activeCard}
            setActiveCard={setActiveCard}
          />
        </Suspense>
      </Canvas>
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-black/60 hover:text-black transition-colors font-mono text-sm tracking-widest uppercase"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-black/40 tracking-widest text-xs font-mono uppercase pointer-events-none">
        Scroll to explore
      </div>

      {/* Dynamic Pictogram Overlay (hidden while preloading) */}
      <div 
        className={`fixed bottom-6 right-6 z-40 pointer-events-none flex flex-col items-center transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Floating Stickman Pictogram directly on the background */}
        <div 
          ref={pictogramRef}
          style={{ '--speed-scale': '1.2s' } as React.CSSProperties}
          className="w-24 h-24 flex items-center justify-center transition-all"
        >
          <svg 
            viewBox="0 0 100 100" 
            className={`w-20 h-20 stroke-orange-500 fill-none ${
              activeCard !== null ? 'gait-paused' : isRunning ? 'gait-running' : 'gait-walking'
            }`} 
            strokeWidth="8" 
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Lean transformation pivoted perfectly at 22deg in CSS for both walking & running to eliminate state shift */}
            <g className="animate-body">
              {/* Proportional Thick Head */}
              <circle cx="50" cy="20" r="9" className="fill-orange-500 stroke-none" />
              {/* Natural Torso */}
              <line x1="50" y1="29" x2="50" y2="54" />
              
              {/* LEFT ARM (Simple straight line bicep swing) */}
              <line x1="50" y1="32" x2="36" y2="46" className="animate-arm-left" style={{ transformOrigin: '50px 32px' }} />

              {/* RIGHT ARM (Simple straight line bicep swing) */}
              <line x1="50" y1="32" x2="64" y2="46" className="animate-arm-right" style={{ transformOrigin: '50px 32px' }} />
              
              {/* LEFT LEG (Thigh + Calf, pivoted at Hip 50,54) */}
              <g className="animate-thigh-left" style={{ transformOrigin: '50px 54px' }}>
                <line x1="50" y1="54" x2="42" y2="68" />
                <g className="animate-calf-left" style={{ transformOrigin: '42px 68px' }}>
                  <line x1="42" y1="68" x2="36" y2="82" />
                </g>
              </g>

              {/* RIGHT LEG (Thigh + Calf, pivoted at Hip 50,54) */}
              <g className="animate-thigh-right" style={{ transformOrigin: '50px 54px' }}>
                <line x1="50" y1="54" x2="58" y2="68" />
                <g className="animate-calf-right" style={{ transformOrigin: '58px 68px' }}>
                  <line x1="58" y1="68" x2="64" y2="82" />
                </g>
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* Full-screen Preloader Overlay */}
      {showLoader && (
        <div 
          className={`fixed inset-0 w-full h-[100dvh] flex flex-col items-center justify-center bg-[#f4f4f5] z-50 transition-opacity duration-1000 ease-in-out ${
            !isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
          }`}
        >
          {/* 1. Central Stickman (100% Identical Walking Gait) */}
          <div className="w-24 h-24 flex items-center justify-center mb-6">
            <svg 
              viewBox="0 0 100 100" 
              className="w-20 h-20 stroke-orange-500 fill-none gait-walking" 
              strokeWidth="8" 
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ '--speed-scale': '1.2s' } as React.CSSProperties}
            >
              <g className="animate-body">
                <circle cx="50" cy="20" r="9" className="fill-orange-500 stroke-none" />
                <line x1="50" y1="29" x2="50" y2="54" />
                
                {/* LEFT ARM */}
                <line x1="50" y1="32" x2="36" y2="46" className="animate-arm-left" style={{ transformOrigin: '50px 32px' }} />

                {/* RIGHT ARM */}
                <line x1="50" y1="32" x2="64" y2="46" className="animate-arm-right" style={{ transformOrigin: '50px 32px' }} />
                
                {/* LEFT LEG */}
                <g className="animate-thigh-left" style={{ transformOrigin: '50px 54px' }}>
                  <line x1="50" y1="54" x2="42" y2="68" />
                  <g className="animate-calf-left" style={{ transformOrigin: '42px 68px' }}>
                    <line x1="42" y1="68" x2="36" y2="82" />
                  </g>
                </g>

                {/* RIGHT LEG */}
                <g className="animate-thigh-right" style={{ transformOrigin: '50px 54px' }}>
                  <line x1="50" y1="54" x2="58" y2="68" />
                  <g className="animate-calf-right" style={{ transformOrigin: '58px 68px' }}>
                    <line x1="58" y1="68" x2="64" y2="82" />
                  </g>
                </g>
              </g>
            </svg>
          </div>

          {/* 2. Sleek Orange Progress Line Bar */}
          <div className="w-[200px] h-[3px] bg-neutral-200 rounded-full overflow-hidden mb-3">
            <div 
              ref={progressBarRef}
              className="h-full bg-orange-500 transition-all duration-300 ease-out"
              style={{ width: '0%' }}
            />
          </div>

          {/* 3. Orange Percentage Text */}
          <span 
            ref={progressTextRef}
            className="text-[11px] font-mono tracking-widest text-orange-500 font-semibold uppercase"
          >
            LOADING 0%
          </span>
        </div>
      )}
    </div>
  );
}
