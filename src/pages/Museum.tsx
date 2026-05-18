import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Static Fallback Data ---
const MOCK_DATA = [
  { id: 1, url: 'https://picsum.photos/seed/nat1/1200/800', title: 'NATURE', subtitle: 'WILDERNESS EXPLORATION' },
  { id: 2, url: 'https://picsum.photos/seed/nat2/1200/800', title: 'MOUNTAINS', subtitle: 'PEAK PERFORMANCE' },
  { id: 3, url: 'https://picsum.photos/seed/nat3/1200/800', title: 'LANDSCAPE', subtitle: 'SCENIC VIEWS' },
  { id: 4, url: 'https://picsum.photos/seed/nat4/1200/800', title: 'VISTAS', subtitle: 'BEYOND HORIZONS' },
  { id: 5, url: 'https://picsum.photos/seed/nat5/1200/800', title: 'FOREST', subtitle: 'DEEP WOODS' },
  { id: 6, url: 'https://picsum.photos/seed/nat6/1200/800', title: 'VALLEY', subtitle: 'LUSH GREENERY' },
  { id: 7, url: 'https://picsum.photos/seed/nat7/1200/800', title: 'WILDLIFE', subtitle: 'NATURAL HABITAT' },
];

const V_SIZE = 15;
const R = 1700;

// --- Sub-component for individual card with zero-flicker fade-in loading ---
interface MuseumCardProps {
  item: any;
  offset: number;
  angle: number;
  overlayOpacity: number;
  onClick: () => void;
  virtualIndex: number;
}

function MuseumCard({ item, offset, angle, overlayOpacity, onClick, virtualIndex }: MuseumCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset loaded state when image changes
  useEffect(() => {
    setIsLoaded(false);
  }, [item?.url]);

  return (
    <div
      className="absolute w-[700px] h-[450px] rounded-xl overflow-hidden bg-neutral-950 cursor-pointer border border-neutral-900/40 shadow-2xl transition-all"
      style={{
        transform: `rotateY(${angle}deg) translateZ(${R}px)`,
      }}
      onClick={onClick}
    >
      {item ? (
        Math.abs(offset) <= 1 ? (
          <div className="relative w-full h-full bg-neutral-950">
            {/* Smooth spinner while image downloads */}
            {!isLoaded && (
              <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center text-neutral-800">
                <Loader2 className="w-8 h-8 text-neutral-700 animate-spin" />
              </div>
            )}
            <img 
              src={item.url} 
              alt={item.title}
              loading="eager"
              // @ts-ignore
              fetchpriority="high"
              decoding="async"
              onLoad={() => setIsLoaded(true)}
              className={`w-full h-full object-cover select-none transition-opacity duration-500 ease-out ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              draggable={false}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-neutral-950" />
        )
      ) : (
        /* Elegant placeholder black card with minimalist image icon */
        <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex flex-col items-center justify-center text-neutral-600 gap-3 border border-neutral-800 select-none">
          <ImageIcon className="w-12 h-12 stroke-[1.2] text-neutral-700 animate-pulse" />
          <span className="text-xs tracking-wider uppercase opacity-40 font-mono">
            EMPTY GALLERY #{virtualIndex + 1}
          </span>
        </div>
      )}
      
      {/* Dynamic overlay — darker for cards farther from front */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
      />
    </div>
  );
}

export default function Museum() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const safeMod = (val: number, n: number) => ((val % n) + n) % n;

  // Fetch photos from manifest
  useEffect(() => {
    fetch('/manifests/Museum.json')
      .then(res => res.json())
      .then(data => {
        if (data.images && data.images.length > 0) {
          setPhotos(data.images);
        } else {
          setPhotos(MOCK_DATA);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load Museum manifest', err);
        setPhotos(MOCK_DATA);
        setIsLoading(false);
      });
  }, []);

  const total = photos.length || 500;

  // Prefetch adjacent photos during idle periods to achieve buttery smooth scrolls
  useEffect(() => {
    if (photos.length === 0) return;

    const timer = setTimeout(() => {
      // Prefetch 3 slides ahead and 3 slides behind
      const targets = [
        safeMod(activeIndex + 2, total),
        safeMod(activeIndex + 3, total),
        safeMod(activeIndex - 2, total),
        safeMod(activeIndex - 3, total)
      ];

      targets.forEach(idx => {
        const item = photos[idx];
        if (item && item.url) {
          const img = new Image();
          img.src = item.url;
        }
      });
    }, 250); // Debounce delay of 250ms

    return () => clearTimeout(timer);
  }, [activeIndex, photos, total]);

  const nextSlide = () => {
    setActiveIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => prev - 1);
  };

  const handleCardClick = (clickedVirtualIndex: number) => {
    const currentMod = safeMod(activeIndex, total);
    
    // Find shortest path in the virtual ring
    let rawOffset = clickedVirtualIndex - currentMod;
    if (rawOffset > Math.floor(total / 2)) rawOffset -= total;
    if (rawOffset < -Math.floor(total / 2)) rawOffset += total;
    
    setActiveIndex((prev) => prev + rawOffset);
  };

  const handleThumbnailClick = (clickedIndex: number) => {
    const currentMod = safeMod(activeIndex, total);
    
    // Find shortest path in the virtual ring
    let rawOffset = clickedIndex - currentMod;
    if (rawOffset > Math.floor(total / 2)) rawOffset -= total;
    if (rawOffset < -Math.floor(total / 2)) rawOffset += total;
    
    setActiveIndex((prev) => prev + rawOffset);
  };

  // Keyboard, Smooth Mouse Wheel & Touch swipe navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };

    const scrollAccumulator = { current: 0 };
    let lastScrollTime = 0;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      
      // Decay or reset accumulator if scrolling stopped for more than 150ms
      if (now - lastScrollTime > 150) {
        scrollAccumulator.current = 0;
      }
      lastScrollTime = now;

      // Accumulate wheel delta
      scrollAccumulator.current += e.deltaY;

      // Sensible threshold for turning 1 slide (80px scroll delta)
      const THRESHOLD = 80;
      if (Math.abs(scrollAccumulator.current) >= THRESHOLD) {
        const steps = Math.trunc(scrollAccumulator.current / THRESHOLD);
        if (steps !== 0) {
          setActiveIndex(prev => prev + steps);
          // Retain remainder for fluid scrolling deceleration and speed mapping
          scrollAccumulator.current %= THRESHOLD;
        }
      }
    };

    // Swipe gestures for touch screens and trackpads
    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchX = e.touches[0].clientX;
      const deltaX = touchStartX - touchX; // Swiping left advances next
      touchStartX = touchX;

      const now = Date.now();
      if (now - lastScrollTime > 150) {
        scrollAccumulator.current = 0;
      }
      lastScrollTime = now;

      // Accumulate horizontal swipe delta (with nice tracking sensitivity)
      scrollAccumulator.current += deltaX * 1.8;

      const THRESHOLD = 80;
      if (Math.abs(scrollAccumulator.current) >= THRESHOLD) {
        const steps = Math.trunc(scrollAccumulator.current / THRESHOLD);
        if (steps !== 0) {
          setActiveIndex(prev => prev + steps);
          scrollAccumulator.current %= THRESHOLD;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [photos]); // Re-subscribe when photos load to use correct total

  if (isLoading) {
    return (
      <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-[#fdfdfd] gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <span className="text-sm font-mono text-gray-400 uppercase tracking-widest">LOADING MUSEUM GALLERY...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100dvh] bg-[#fdfdfd] overflow-hidden flex items-center justify-center font-sans">
      
      {/* Background Ripple Pattern (SVG) - Faint black concentric wavy lines on white */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="topographicPattern" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
              <path d="M 0 50 Q 100 0, 200 50 T 400 50 M 0 100 Q 100 50, 200 100 T 400 100 M 0 150 Q 100 100, 200 150 T 400 150 M 0 200 Q 100 150, 200 200 T 400 200 M 0 250 Q 100 200, 200 250 T 400 250 M 0 300 Q 100 250, 200 300 T 400 300 M 0 350 Q 100 300, 200 350 T 400 350" fill="none" stroke="#000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#topographicPattern)" />
        </svg>
      </div>

      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-black/60 hover:text-black transition-colors font-mono text-sm tracking-widest uppercase"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* 3D Cover Flow Container */}
      <div 
        className="relative w-full max-w-[1200px] h-[600px] flex items-center justify-center z-10"
        style={{ perspective: '1800px', transformStyle: 'preserve-3d' }}
      >
        {/* Outer Swaying Container tilted backward to naturally lower the back photos */}
        <motion.div
          className="absolute w-full h-full flex items-center justify-center"
          animate={{
            y: [-15, 15, -15],
            rotateZ: [-5, -6, -4, -5],
            rotateX: [-6, -10, -6]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Inner Rotating Cylinder */}
          <motion.div
            className="absolute w-full h-full flex items-center justify-center"
            animate={{ 
              rotateY: -activeIndex * (360 / V_SIZE),
              z: -R // Match the radius so the front card appears at normal scale
            }}
            transition={{
              type: 'spring',
              stiffness: 80,
              damping: 20,
              mass: 1
            }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {Array.from({ length: V_SIZE }).map((_, j) => {
              const angle = j * (360 / V_SIZE);
              
              const activeSlot = safeMod(activeIndex, V_SIZE);
              let offset = j - activeSlot;
              if (offset > V_SIZE / 2) offset -= V_SIZE;
              if (offset < -V_SIZE / 2) offset += V_SIZE;
              
              const virtualIndex = safeMod(activeIndex + offset, total);
              const distFromFront = Math.abs(offset) / (V_SIZE / 2); // 0 = front, 1 = back
              const overlayOpacity = 0.05 + distFromFront * 0.6; // front: 5% dark, back: ~65% dark
 
              const item = photos[virtualIndex];

              return (
                <MuseumCard
                  key={`slot-${j}`}
                  item={item}
                  offset={offset}
                  angle={angle}
                  overlayOpacity={overlayOpacity}
                  virtualIndex={virtualIndex}
                  onClick={() => handleCardClick(virtualIndex)}
                />
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* Minimalist Top-Right Navigation Controls */}
      <div className="absolute top-8 right-8 z-50 flex items-center gap-5">
        <button 
          onClick={prevSlide}
          className="p-1 text-black/40 hover:text-black transition-colors group"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform stroke-[1.5]" />
        </button>
        <button 
          onClick={nextSlide}
          className="p-1 text-black/40 hover:text-black transition-colors group"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform stroke-[1.5]" />
        </button>
      </div>

      {/* Thumbnails (Bottom Right) - Sliding window of 7 thumbnails */}
      <div className="absolute bottom-8 right-12 flex gap-3 z-50 bg-white/80 p-3 rounded-2xl backdrop-blur-md shadow-lg border border-gray-100">
        {Array.from({ length: Math.min(7, total) }).map((_, index) => {
          const activeMod = safeMod(activeIndex, total);
          let targetIndex = activeMod - 3 + index;
          targetIndex = safeMod(targetIndex, total);
          
          const item = photos[targetIndex];
          if (!item) return null;

          const isActive = targetIndex === activeMod;

          return (
            <button
              key={`thumb-${item.key || targetIndex}`}
              onClick={() => handleThumbnailClick(targetIndex)}
              className={`relative w-16 h-12 rounded-lg overflow-hidden transition-all duration-300 ${
                isActive 
                  ? 'ring-2 ring-blue-500 ring-offset-2 scale-110 shadow-md' 
                  : 'opacity-50 hover:opacity-100 grayscale hover:grayscale-0'
              }`}
            >
              <img src={item.url} alt={`thumb-${targetIndex}`} className="w-full h-full object-cover" />
            </button>
          );
        })}
      </div>

    </div>
  );
}
