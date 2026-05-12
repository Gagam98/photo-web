import { useRef, useState } from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

gsap.registerPlugin(Observer);

const PHOTO_DATA = [
  {
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800',
    camera: 'Sony A7III',
    exif: '24.0mm, 1/500s, f/2.8',
    date: '12. August. 2022',
    latLong: "35°42'2\"N, 139°42'54\"E"
  },
  {
    url: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?q=80&w=800',
    camera: 'Canon EOS R5',
    exif: '50.0mm, 1/1000s, f/1.4',
    date: '05. September. 2023',
    latLong: "40°45'21\"N, 73°58'11\"W"
  },
  {
    url: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=800',
    camera: 'Fujifilm X-T4',
    exif: '18.0mm, 1/250s, f/4.0',
    date: '22. October. 2021',
    latLong: "48°51'24\"N, 2°21'08\"E"
  },
  {
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800',
    camera: 'Nikon Z7 II',
    exif: '85.0mm, 1/2000s, f/1.8',
    date: '14. February. 2020',
    latLong: "34°03'08\"N, 118°14'37\"W"
  },
  {
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800',
    camera: 'Sony A1',
    exif: '14.0mm, 1/100s, f/8.0',
    date: '30. March. 2024',
    latLong: "64°08'45\"N, 21°55'41\"W"
  },
  {
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800',
    camera: 'Leica Q2',
    exif: '28.0mm, 1/125s, f/1.7',
    date: '08. July. 2019',
    latLong: "51°30'26\"N, 0°07'39\"W"
  },
  {
    url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800',
    camera: 'Canon EOS 5D Mark IV',
    exif: '200.0mm, 1/800s, f/2.8',
    date: '19. November. 2022',
    latLong: "41°53'31\"N, 12°29'12\"E"
  },
  {
    url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=800',
    camera: 'Panasonic Lumix S5',
    exif: '35.0mm, 1/60s, f/5.6',
    date: '02. January. 2021',
    latLong: "37°46'30\"N, 122°25'06\"W"
  }
];

export default function PhotoCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Active Photo Data State
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  // Speed Control State
  const SPEEDS = [-0.0005, -0.0015, -0.0030, -0.0050];
  const [speedIndex, setSpeedIndex] = useState(1);
  const speedRef = useRef(SPEEDS[1]);

  const increaseSpeed = () => {
    setSpeedIndex(prev => {
      const next = Math.min(prev + 1, SPEEDS.length - 1);
      speedRef.current = SPEEDS[next];
      return next;
    });
  };

  const decreaseSpeed = () => {
    setSpeedIndex(prev => {
      const next = Math.max(prev - 1, 0);
      speedRef.current = SPEEDS[next];
      return next;
    });
  };

  useGSAP(() => {
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
        
        // 루프를 위해 타임라인의 맨 끝(T=마지막)에 첫 번째 아이템이 다시 등장하도록 세팅
        // 내려가 있던 상태에서 다시 위로 위치를 리셋한 뒤 내려오게 함
        itemTl.set(item, { rotation: 60 }, totalItems * duration - duration);
        itemTl.to(item, {
          rotation: 0,
          opacity: 1,
          scale: 1,
          duration: duration,
          ease: "power1.inOut"
        }, totalItems * duration - duration);

      } else {
        // 다른 아이템들은 자신의 순서에 맞게 들어왔다 나감
        const enterTime = i * duration - duration;
        const exitTime = i * duration;

        // 중앙으로 들어오는 애니메이션
        itemTl.to(item, {
          rotation: 0,
          opacity: 1,
          scale: 1,
          duration: duration,
          ease: "power1.inOut"
        }, enterTime);

        // 아래로 나가는 애니메이션
        itemTl.to(item, {
          rotation: -60,
          opacity: 0,
          scale: 0.8,
          duration: duration,
          ease: "power1.inOut"
        }, exitTime);
      }

      // 개별 아이템 타임라인을 메인 타임라인의 0초 위치에 모두 병합 (시간은 절대값으로 세팅됨)
      tl.add(itemTl, 0);
    });

    // 물리적 스크롤바가 없는 가상(Virtual) 스크롤 로직 적용
    const proxy = { progress: 0 };
    const wrapProgress = gsap.utils.wrap(0, 1);
    let currentScroll = 0;

    Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      wheelSpeed: -1,
      onChange: (self) => {
        // 스크롤 방향과 양에 따라 진행도 계산 (speedRef 사용)
        currentScroll += self.deltaY * speedRef.current;
        
        // Proxy 객체를 연속적으로 부드럽게 애니메이션
        gsap.to(proxy, {
          progress: currentScroll,
          duration: 0.8,
          ease: "power2.out",
          onUpdate: () => {
            const currentProgress = wrapProgress(proxy.progress);
            tl.progress(currentProgress);
            
            // 현재 화면에 가장 가까운 사진의 인덱스를 계산하여 상태 업데이트
            const newIndex = Math.round(currentProgress * totalItems) % totalItems;
            if (newIndex !== activeIndexRef.current) {
              activeIndexRef.current = newIndex;
              setActiveIndex(newIndex);
            }
          }
        });
      }
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full h-[100dvh] bg-[#f4f4f5] overflow-hidden flex items-center justify-center touch-none select-none">
      
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <div className="absolute top-8 left-8 text-neutral-900 z-10 pointer-events-none">
        <h1 className="text-3xl font-bold uppercase tracking-widest">Dial Gallery</h1>
      </div>

      {/* EXIF Information (Bottom Left) */}
      <div className="absolute bottom-12 left-8 z-20 pointer-events-none font-mono flex flex-col gap-5">
        <div className="text-6xl font-light text-neutral-400 mb-1 tracking-tighter">
          <span className="text-neutral-900 font-medium">{String(activeIndex + 1).padStart(2, '0')}</span><span className="text-4xl text-neutral-400">/{String(PHOTO_DATA.length).padStart(2, '0')}</span>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-[9px] text-neutral-400 tracking-[0.2em] uppercase">Date</span>
          <span className="text-xs font-bold tracking-wider text-neutral-900">{PHOTO_DATA[activeIndex].date}</span>
        </div>
      </div>

      <a href="/" className="absolute top-8 right-8 text-neutral-500 hover:text-neutral-900 border border-neutral-300 hover:border-neutral-900 px-4 py-2 rounded-full text-sm font-mono uppercase z-10 transition-colors">
        Back
      </a>

      {/* Speed Controls (Left Side) */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-20">
        <button 
          onClick={increaseSpeed}
          className={`w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center border transition-colors ${speedIndex === SPEEDS.length - 1 ? 'border-red-500 text-red-500' : 'border-neutral-900 text-white hover:bg-black'}`}
          title="Increase Speed"
        >
          <ChevronUp size={20} />
        </button>
        <div className="text-center flex flex-col items-center pointer-events-none text-neutral-900">
          <span className="font-bold text-sm tracking-wider uppercase">Control</span>
          <span className="text-[10px] text-neutral-500 tracking-widest uppercase">Speed</span>
        </div>
        <button 
          onClick={decreaseSpeed}
          className={`w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center border transition-colors ${speedIndex === 0 ? 'border-red-500 text-red-500' : 'border-neutral-900 text-white hover:bg-black'}`}
          title="Decrease Speed"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      {/* 사진들을 겹쳐 놓을 중앙 컨테이너 */}
      <div className="relative w-[350px] h-[500px] z-10">
        {PHOTO_DATA.map((data, idx) => (
          <img
            key={idx}
            src={data.url}
            alt={`Photo ${idx + 1} by ${data.camera}`}
            className="gallery-item absolute inset-0 w-full h-full object-cover rounded-2xl border border-black/10"
          />
        ))}
      </div>
    </div>
  );
}
