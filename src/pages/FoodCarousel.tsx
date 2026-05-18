import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(Observer);

// Fallback static data if manifest fails
const FALLBACK_ITEM = {
  url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800',
  camera: 'Sony A7III',
  exif: '24.0mm, 1/500s, f/2.8',
  date: '12. August. 2022',
  latLong: "35°42'2\"N, 139°42'54\"E"
};
const FALLBACK_DATA = Array(4).fill(FALLBACK_ITEM);

// Transparent 1x1 pixel for lazy loading
const TRANSPARENT_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export default function FoodCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [photoData, setPhotoData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch photos from manifest
  useEffect(() => {
    fetch('/manifests/Food.json')
      .then(res => res.json())
      .then(data => {
        if (data.images && data.images.length > 0) {
          // Use all photos, but randomize the order
          const shuffled = [...data.images].sort(() => Math.random() - 0.5);

          // Add fallback metadata & generate deterministic stable dates (Jan 2020 - Apr 2026) based on url hash
          const enhancedData = shuffled.map((img: any) => {
            // Helper to generate a deterministic integer hash from a string
            let hash = 0;
            const str = img.url || "";
            for (let i = 0; i < str.length; i++) {
              hash = (hash << 5) - hash + str.charCodeAt(i);
              hash |= 0; // Convert to 32bit integer
            }
            const seed = Math.abs(hash);

            const startMs = new Date('2020-01-01').getTime();
            const endMs = new Date('2026-04-30').getTime();
            const totalDays = Math.floor((endMs - startMs) / (24 * 60 * 60 * 1000)); // ~2311 days
            
            const dayOffset = seed % totalDays;
            const dateObj = new Date(startMs + dayOffset * 24 * 60 * 60 * 1000);

            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const formattedDate = `${dateObj.getDate()}. ${monthNames[dateObj.getMonth()]}. ${dateObj.getFullYear()}`;

            return {
              url: img.url,
              camera: img.title || 'Unknown',
              date: formattedDate,
              exif: 'N/A',
              latLong: 'N/A'
            };
          });
          setPhotoData(enhancedData);
        } else {
          setPhotoData(FALLBACK_DATA);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load Food manifest', err);
        setPhotoData(FALLBACK_DATA);
        setIsLoading(false);
      });
  }, []);

  // Active Photo Data State
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  // Click & hold to pause state
  const [isHolding, setIsHolding] = useState(false);
  const isHoldingRef = useRef(false);
  useEffect(() => {
    isHoldingRef.current = isHolding;
  }, [isHolding]);

  useGSAP(() => {
    if (photoData.length === 0) return;

    const items = gsap.utils.toArray('.gallery-item') as HTMLElement[];
    const totalItems = items.length;
    
    // Initialize all items at the top position
    gsap.set(items, {
      transformOrigin: "1350px 50%", 
      rotation: 60,                  
      opacity: 0,
      scale: 0.8,
    });

    // paused 상태의 타임라인 생성
    const tl = gsap.timeline({ paused: true });

    const duration = 1;

    items.forEach((item: any, i) => {
      const itemTl = gsap.timeline();
      
      if (i === 0) {
        // 첫 번째 아이템은 처음(T=0)에 이미 중앙에 있음
        gsap.set(item, { rotation: 0, opacity: 1, scale: 1 });
        
        // T=0 부터 T=1 까지 아래로 빠짐
        itemTl.to(item, {
          rotation: -60,
          opacity: 0,
          scale: 0.8,
          duration: duration,
          ease: "power1.inOut"
        }, 0);
        
        // T=1 부터 T=totalItems - 1 까지는 아래쪽(-60)에서 보이지 않게 대기
        if (totalItems > 2) {
          itemTl.to(item, {
            rotation: -60,
            opacity: 0,
            scale: 0.8,
            duration: (totalItems - 2) * duration,
            ease: "none"
          }, duration);
        }

        // T=totalItems - 1 에 위쪽(60)으로 순간이동
        itemTl.set(item, { rotation: 60, opacity: 0, scale: 0.8 }, totalItems * duration - duration);
        
        // T=totalItems - 1 부터 T=totalItems 까지 위에서 중앙으로 들어옴
        itemTl.to(item, {
          rotation: 0,
          opacity: 1,
          scale: 1,
          duration: duration,
          ease: "power1.inOut"
        }, totalItems * duration - duration);

      } else {
        const enterTime = i * duration - duration;
        const exitTime = i * duration;

        // 1. T=0 부터 T=enterTime 까지는 위쪽(60)에서 보이지 않게 대기
        if (enterTime > 0) {
          itemTl.to(item, {
            rotation: 60,
            opacity: 0,
            scale: 0.8,
            duration: enterTime,
            ease: "none"
          }, 0);
        }

        // 2. 중앙으로 들어오는 애니메이션 (duration)
        itemTl.to(item, {
          rotation: 0,
          opacity: 1,
          scale: 1,
          duration: duration,
          ease: "power1.inOut"
        }, enterTime);

        // 3. 아래로 나가는 애니메이션 (duration)
        itemTl.to(item, {
          rotation: -60,
          opacity: 0,
          scale: 0.8,
          duration: duration,
          ease: "power1.inOut"
        }, exitTime);

        // 4. 나간 이후부터 타임라인 끝까지 아래쪽(-60)에서 보이지 않게 대기
        const remainingTime = (totalItems * duration) - (exitTime + duration);
        if (remainingTime > 0) {
          itemTl.to(item, {
            rotation: -60,
            opacity: 0,
            scale: 0.8,
            duration: remainingTime,
            ease: "none"
          }, exitTime + duration);
        }
      }

      // 개별 아이템 타임라인을 메인 타임라인의 0초 위치에 모두 병합 (시간은 절대값으로 세팅됨)
      tl.add(itemTl, 0);
    });

    // 물리적 스크롤바가 없는 가상(Virtual) 스크롤 로직 적용
    const proxy = { progress: 0 };
    const wrapProgress = gsap.utils.wrap(0, 1);
    let currentScroll = 0;

    // Define comfortable base manual scroll sensitivity
    const SCROLL_SENSITIVITY = -0.00015;

    const observer = Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      wheelSpeed: -1,
      onChange: (self) => {
        // 1. Calculate manual scroll progress delta
        currentScroll += self.deltaY * SCROLL_SENSITIVITY;
      }
    });

    // 3. Gentle and very slow Auto-scroll with unified smooth damping interpolation
    const tick = (_time: number, deltaTime: number) => {
      const deltaSeconds = deltaTime / 1000;
      
      // Elegant auto-scroll speed (0.003 progress units per second)
      // Skip auto scroll increment entirely when user is holding/clicking
      if (!isHoldingRef.current) {
        const AUTO_SCROLL_SPEED = 0.002;
        currentScroll += AUTO_SCROLL_SPEED * deltaSeconds;
      }
      
      // Smoothly interpolate proxy.progress towards currentScroll.
      // Damping automatically handles scroll velocity: high speed is responsive, slow is zen.
      // 0.06 damping factor yields an extremely premium, tactile deceleration!
      proxy.progress += (currentScroll - proxy.progress) * 0.06;
      
      const currentProgress = wrapProgress(proxy.progress);
      tl.progress(currentProgress);
      
      // Check index and update lazy loaded images
      const newIndex = Math.round(currentProgress * totalItems) % totalItems;
      if (newIndex !== activeIndexRef.current) {
        activeIndexRef.current = newIndex;
        setActiveIndex(newIndex);

        // Keep extreme lazy loading
        const range = 5;
        for (let i = -range; i <= range; i++) {
          let targetIdx = (newIndex + i) % totalItems;
          if (targetIdx < 0) targetIdx += totalItems;
          
          const imgEl = imageRefs.current[targetIdx];
          if (imgEl && imgEl.src !== imgEl.dataset.src) {
            imgEl.src = imgEl.dataset.src!;
          }
        }
      }
    };

    gsap.ticker.add(tick);

    return () => {
      observer.kill();
      tl.kill();
      gsap.ticker.remove(tick);
    };

  }, { scope: containerRef, dependencies: [photoData] });

  if (isLoading) {
    return (
      <div className="relative w-full h-[100dvh] bg-[#f4f4f5] flex items-center justify-center">
        <div className="text-neutral-500 font-mono text-sm">Loading Gallery...</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[100dvh] bg-[#f4f4f5] overflow-hidden flex items-center justify-center touch-none select-none"
      onMouseDown={() => setIsHolding(true)}
      onMouseUp={() => setIsHolding(false)}
      onMouseLeave={() => setIsHolding(false)}
      onTouchStart={() => setIsHolding(true)}
      onTouchEnd={() => setIsHolding(false)}
      onTouchCancel={() => setIsHolding(false)}
    >
      
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Spoon Pictogram (Left Center Background) */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-65 select-none">
        <svg viewBox="0 0 100 200" className="w-12 h-24 stroke-neutral-700 fill-none stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
          <path d="M50 30 C35 30, 35 70, 50 85 C65 70, 65 30, 50 30 Z" className="fill-neutral-300/35" />
          <path d="M50 85 L50 170" />
        </svg>
      </div>

      {/* Chopsticks Pictogram (Right Center Background) */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-65 select-none">
        <svg viewBox="0 0 100 200" className="w-12 h-24 stroke-neutral-700 fill-none stroke-[2]" strokeLinecap="round" strokeLinejoin="round">
          <line x1="42" y1="25" x2="42" y2="175" strokeWidth="2.5" />
          <line x1="58" y1="25" x2="58" y2="175" strokeWidth="2.5" />
        </svg>
      </div>

      {/* Concentric Plate Pictogram (Centered, directly behind the photo stack) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-45 select-none">
        <svg viewBox="0 0 200 200" className="w-64 h-64 stroke-neutral-500 fill-none stroke-[1.5]">
          <circle cx="100" cy="100" r="90" />
          <circle cx="100" cy="100" r="55" />
        </svg>
      </div>

      {/* Back Button (Top Left) */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-black/60 hover:text-black transition-colors font-mono text-sm tracking-widest uppercase"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* EXIF Information (Bottom Left) */}
      <div className="absolute bottom-12 left-8 z-20 pointer-events-none font-mono flex flex-col gap-5">
        <div className="text-6xl font-light text-neutral-400 mb-1 tracking-tighter">
          <span className="text-neutral-900 font-medium">{String(activeIndex + 1).padStart(2, '0')}</span><span className="text-4xl text-neutral-400">/{String(photoData.length).padStart(2, '0')}</span>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-neutral-400 tracking-[0.2em] uppercase">Date</span>
          <span className="text-xs font-bold tracking-wider text-neutral-900">{photoData[activeIndex]?.date}</span>
        </div>
      </div>

      {/* 사진들을 겹쳐 놓을 중앙 컨테이너 */}
      <div className="relative w-[350px] h-[500px] z-10">
        {photoData.map((data, idx) => {
          // Preload the first few and last few images to avoid flicker at start
          const isInitialNear = idx <= 5 || idx >= photoData.length - 5;
          return (
            <div key={idx} className="gallery-item absolute inset-0 w-full h-full rounded-2xl border border-black/10 overflow-hidden bg-neutral-200">
              <img
                ref={el => { imageRefs.current[idx] = el; }}
                src={isInitialNear ? data.url : TRANSPARENT_PIXEL}
                data-src={data.url}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
                decoding="async"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
