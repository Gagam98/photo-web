import { useState, useRef, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Image, Video, Monitor, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Types ---
type WindowType = 'photo' | 'video' | 'decorative';

interface WindowData {
  id: string;
  type: WindowType;
  title: string;
  isOpen: boolean;
  defaultX: number;
  defaultY: number;
  defaultW?: number;
  defaultH?: number;
  zIndex: number;
  url?: string;
}

// --- Helpers ---
function formatGameTitle(title: string): string {
  if (!title) return '';
  const match = title.match(/^(\d{4})(\d{2})(\d{2})/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}`;
  }
  return title;
}


// --- Initial Data ---
const INITIAL_WINDOWS: WindowData[] = [
  { id: 'win-2', type: 'photo', title: 'Splatoon', isOpen: true, defaultX: 100, defaultY: 50, defaultW: 460, defaultH: 320, zIndex: 11 },
  { id: 'win-3', type: 'video', title: 'Gameplay Video', isOpen: true, defaultX: 250, defaultY: 340, defaultW: 500, defaultH: 360, zIndex: 12 },
  { id: 'win-4', type: 'photo', title: 'Animal Crossing', isOpen: true, defaultX: 620, defaultY: 80, defaultW: 420, defaultH: 450, zIndex: 13 },
  { id: 'win-5', type: 'photo', title: 'Game Photos', isOpen: true, defaultX: 850, defaultY: 350, defaultW: 500, defaultH: 350, zIndex: 14 },
];

// --- Doodles (SVG) ---
const SunDoodle = () => (
  <svg width="550" height="550" viewBox="0 0 200 200" className="absolute top-0 left-0 text-green-500 opacity-60 pointer-events-none -translate-x-1/4 -translate-y-1/4">
    <path d="M100 50 A 50 50 0 1 0 150 100 A 50 50 0 0 0 100 50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
    <path d="M100 20 L100 40 M100 160 L100 180 M20 100 L40 100 M160 100 L180 100 M43 43 L57 57 M143 143 L157 157 M43 157 L57 143 M143 43 L157 57" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

const HeartDoodle = () => (
  <svg width="380" height="380" viewBox="0 0 100 100" className="absolute bottom-8 right-8 text-green-500 opacity-70 pointer-events-none">
    <path d="M50 85 L15 50 A 20 20 0 0 1 50 25 A 20 20 0 0 1 85 50 Z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// --- Window Component ---
const OSWindow = ({ 
  data, 
  onClose, 
  onFocus,
  photos = []
}: { 
  data: WindowData; 
  onClose: () => void;
  onFocus: () => void;
  photos?: any[];
}) => {
  const dragControls = useDragControls();
  const [size, setSize] = useState({ w: data.defaultW || 200, h: data.defaultH || 200 });

  // Playlist is already stable and pre-shuffled in the parent!
  const windowPhotos = photos;

  const [photoIndex, setPhotoIndex] = useState(0);

  const activePhoto = windowPhotos[photoIndex] || null;
  const imageUrl = activePhoto?.url || data.url;

  // Custom fallback titles for OS window headers
  const getFallbackTitle = (id: string) => {
    if (id === 'win-2') return 'Splatoon';
    if (id === 'win-4') return 'Animal Crossing';
    if (id === 'win-5') return 'Nintendo Mix';
    return 'Gameplay Video';
  };

  const imageTitle = activePhoto 
    ? formatGameTitle(activePhoto.title)
    : getFallbackTitle(data.id);

  const isDecorative = data.type === 'decorative';

  // Helper to render icon based on type
  const renderIcon = (type: WindowType, className = "w-4 h-4") => {
    if (type === 'photo') return <Image className={className} />;
    if (type === 'video') return <Video className={className} />;
    return <Monitor className={className} />;
  };

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={{ x: data.defaultX, y: data.defaultY, opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onPointerDown={onFocus}
      style={{ zIndex: data.zIndex }}
      className={`absolute flex flex-col bg-white border-2 border-green-600 shadow-[4px_4px_0px_0px_rgba(22,163,74,1)] ${!isDecorative ? 'overflow-hidden' : ''}`}
    >
      {/* Title Bar - Drag Handle */}
      <div 
        className="h-7 border-b-2 border-green-600 flex items-center justify-between px-2 cursor-grab active:cursor-grabbing bg-white select-none"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <span className="text-green-700 flex items-center gap-2 font-mono text-xs font-bold truncate max-w-[80%]">
          {renderIcon(data.type)}
          {data.type === 'photo' ? imageTitle : data.title}
        </span>
        <button 
          onClick={onClose}
          className="w-4 h-4 flex items-center justify-center border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors"
        >
          <svg viewBox="0 0 10 10" className="w-2 h-2 fill-current">
            <path d="M1,1 L9,9 M9,1 L1,9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div 
        className="bg-[#fafafa] relative"
        style={!isDecorative ? { 
          width: size.w, 
          height: size.h, 
          overflow: 'hidden' 
        } : { padding: '20px' }}
      >
        {data.type === 'photo' && (
          <div className="w-full h-full bg-black relative group select-none flex items-center justify-center">
            {imageUrl ? (
              <>
                <img 
                  src={imageUrl} 
                  alt={imageTitle}
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
                
                {/* Horizontal navigation controls on hover */}
                {windowPhotos.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoIndex(prev => (prev - 1 + windowPhotos.length) % windowPhotos.length);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 text-white rounded hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoIndex(prev => (prev + 1) % windowPhotos.length);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 text-white rounded hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    
                    {/* Exif/Tag Badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-[10px] text-green-400 border border-green-800 font-mono opacity-0 group-hover:opacity-100 transition-opacity rounded">
                      {photoIndex + 1} / {windowPhotos.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <span className="text-white/30 text-xs font-mono uppercase tracking-widest">photo</span>
            )}
            
            {/* Custom Resize Handle (Bottom Right) */}
            <motion.div
              className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex flex-col items-end justify-end p-1 opacity-50 hover:opacity-100 z-30"
              onPan={(e, info) => {
                e.stopPropagation();
                setSize(s => ({
                  w: Math.max(150, s.w + info.delta.x),
                  h: Math.max(100, s.h + info.delta.y)
                }));
              }}
            >
              <div className="w-2 h-2 border-b-2 border-r-2 border-green-500 pointer-events-none" />
            </motion.div>
          </div>
        )}

        {data.type === 'video' && (
          <div className="w-full h-full bg-black relative group select-none flex items-center justify-center">
            {imageUrl ? (
              <>
                <video 
                  src={imageUrl} 
                  controls
                  playsInline
                  loop
                  className="w-full h-full object-contain"
                />
                
                {/* Horizontal navigation controls on hover */}
                {windowPhotos.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoIndex(prev => (prev - 1 + windowPhotos.length) % windowPhotos.length);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 text-white rounded hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-20"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoIndex(prev => (prev + 1) % windowPhotos.length);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 text-white rounded hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 z-20"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    
                    {/* Exif/Tag Badge */}
                    <div className="absolute bottom-12 left-2 px-2 py-0.5 bg-black/70 text-[10px] text-green-400 border border-green-800 font-mono opacity-0 group-hover:opacity-100 transition-opacity rounded z-20">
                      {photoIndex + 1} / {windowPhotos.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <span className="text-white/30 text-xs font-mono uppercase tracking-widest">video</span>
            )}
            
            {/* Custom Resize Handle (Bottom Right) */}
            <motion.div
              className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex flex-col items-end justify-end p-1 opacity-50 hover:opacity-100 z-30"
              onPan={(e, info) => {
                e.stopPropagation();
                setSize(s => ({
                  w: Math.max(150, s.w + info.delta.x),
                  h: Math.max(100, s.h + info.delta.y)
                }));
              }}
            >
              <div className="w-2 h-2 border-b-2 border-r-2 border-green-500 pointer-events-none" />
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function Game() {
  const [windows, setWindows] = useState<WindowData[]>(INITIAL_WINDOWS);
  const [splatoonList, setSplatoonList] = useState<any[]>([]);
  const [animalCrossingList, setAnimalCrossingList] = useState<any[]>([]);
  const [thirdList, setThirdList] = useState<any[]>([]);
  const [videoList, setVideoList] = useState<any[]>([]);
  const maxZIndex = useRef(20);

  // Fetch photos from manifest and prepare stable shuffled game lists once on mount
  useEffect(() => {
    fetch('/manifests/Game.json')
      .then(res => res.json())
      .then(data => {
        if (data.images && data.images.length > 0) {
          const allPhotos = data.images;

          // 1. Splatoon (shuffled once)
          const spl = allPhotos
            .filter((p: any) => p.folder === 'splatoon')
            .sort(() => Math.random() - 0.5);
          setSplatoonList(spl);

          // 2. Animal Crossing (shuffled once)
          const ac = allPhotos
            .filter((p: any) => p.folder === 'animal_crossing')
            .sort(() => Math.random() - 0.5);
          setAnimalCrossingList(ac);

          // 3. Combined Ring Fit, Tomodachi, Pokemon (shuffled once)
          const candidates = ['ring_fit', 'tomodachi', 'poketmon'];
          const third = allPhotos
            .filter((p: any) => candidates.includes(p.folder))
            .sort(() => Math.random() - 0.5);
          setThirdList(third);

          // 4. Gameplay Videos (shuffled once)
          const vids = allPhotos
            .filter((p: any) => p.folder === 'video')
            .sort(() => Math.random() - 0.5);
          setVideoList(vids);
        }
      })
      .catch(err => {
        console.error('Failed to load Game manifest', err);
      });
  }, []);

  const handleClose = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
  };

  const handleFocus = (id: string) => {
    maxZIndex.current += 1;
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: maxZIndex.current } : w));
  };

  const handleRestore = (id: string) => {
    maxZIndex.current += 1;
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: true, zIndex: maxZIndex.current } : w));
  };

  const renderIcon = (type: WindowType, className = "w-4 h-4") => {
    if (type === 'photo') return <Image className={className} />;
    if (type === 'video') return <Video className={className} />;
    return <Monitor className={className} />;
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#f8fcf8] overflow-hidden">
      {/* Graph Paper Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />

      {/* Doodles */}
      <SunDoodle />
      <HeartDoodle />

      {/* OS Windows */}
      {windows.filter(w => w.isOpen).map(w => {
        // Filter photos specifically by folder for each window
        let filteredPhotos = [];
        if (w.id === 'win-2') {
          filteredPhotos = splatoonList;
        } else if (w.id === 'win-4') {
          filteredPhotos = animalCrossingList;
        } else if (w.id === 'win-5') {
          filteredPhotos = thirdList;
        } else if (w.id === 'win-3') {
          filteredPhotos = videoList;
        }

        return (
          <OSWindow 
            key={w.id} 
            data={w} 
            onClose={() => handleClose(w.id)}
            onFocus={() => handleFocus(w.id)}
            photos={filteredPhotos}
          />
        );
      })}

      {/* Bottom Dock / Taskbar for closed windows */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 px-4 py-2 bg-white border-2 border-green-600 shadow-[4px_4px_0px_0px_rgba(22,163,74,1)] z-50 rounded-lg">
        <div className="text-xs font-mono font-bold text-green-700 flex items-center pr-4 border-r-2 border-green-200">
          TRAY
        </div>
        {windows.map(w => (
          <button
            key={w.id}
            onClick={() => handleRestore(w.id)}
            className={`px-3 py-1 border-2 border-green-600 rounded text-xs font-mono transition-all flex items-center justify-center gap-1.5 ${
              w.isOpen 
                ? 'bg-green-50 border-green-200 text-green-300 cursor-default opacity-50 shadow-inner' 
                : 'bg-white text-green-700 hover:bg-green-600 hover:text-white shadow-[2px_2px_0px_0px_rgba(22,163,74,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(22,163,74,1)]'
            }`}
            title={w.id === 'win-5' ? 'Nintendo Mix' : w.title}
          >
            {renderIcon(w.type, "w-4 h-4")}
            <span className="font-bold text-[9px] tracking-wider uppercase">
              {w.id === 'win-2' ? 'SPLATOON' : 
               w.id === 'win-4' ? 'ANIMAL CROSSING' : 
               w.id === 'win-5' ? 'NINTENDO MIX' : 
               'VIDEO'}
            </span>
          </button>
        ))}
      </div>

      {/* Back to Home */}
      <a href="/" className="absolute top-6 left-6 px-4 py-2 bg-white border-2 border-green-600 text-green-700 font-mono text-sm font-bold shadow-[4px_4px_0px_0px_rgba(22,163,74,1)] hover:bg-green-600 hover:text-white transition-colors z-50">
        BACK
      </a>
    </div>
  );
}
