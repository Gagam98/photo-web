import { motion, AnimatePresence } from 'framer-motion';

export interface PanelItem {
  id: string;
  name: string;
  details: string;
  diagram: string;
}

interface SidePanelProps {
  item: PanelItem | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const SidePanel = ({ item, onClose, onNext, onPrev }: SidePanelProps) => {
  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full md:w-[45vw] z-50 flex shadow-2xl"
          >
            {/* Spiral Notebook Binding Graphics */}
            <div className="w-8 h-full bg-[#e3e3dd] border-r border-[#c4c4be] flex flex-col justify-around py-12 z-10 relative shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
               {Array.from({ length: 24 }).map((_, i) => (
                 <div key={i} className="w-10 h-3 ml-2 border border-slate-600 rounded-full bg-gradient-to-b from-gray-200 to-gray-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] transform -rotate-12 translate-x-[-12px]" />
               ))}
               {/* Binder hole punch holes */}
               <div className="absolute left-4 top-0 h-full w-full flex flex-col justify-around py-12 pointer-events-none">
                 {Array.from({ length: 24 }).map((_, i) => (
                   <div key={`hole-${i}`} className="w-4 h-4 rounded-full bg-[#111] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]" />
                 ))}
               </div>
            </div>

            {/* Notebook Paper Content */}
            <div className="flex-1 h-full bg-[#F5F5F0] overflow-y-auto relative" 
                 style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #d1d5db 31px, #d1d5db 32px)', backgroundSize: '100% 32px', backgroundPosition: '0 8px' }}>
              
              <div className="p-12 pb-32">
                <div className="font-mono text-sm tracking-widest text-slate-500 mb-8 pb-4 border-b-2 border-slate-800 flex justify-between uppercase">
                  <span>Fig. 0{item.id}A</span>
                  <span>Page 0{item.id}</span>
                </div>
                
                <h2 className="text-4xl font-bold font-sans text-slate-900 uppercase tracking-tighter mb-8 leading-none bg-[#F5F5F0]">
                  {item.name}
                </h2>
                
                <p className="font-mono text-sm text-slate-700 leading-relaxed max-w-lg mb-12 bg-[#F5F5F0] py-2">
                  {item.details}
                </p>

                <div className="border border-slate-800 p-6 bg-white/50 relative">
                    <span className="absolute top-0 right-0 bg-slate-800 text-white font-mono text-[10px] px-2 py-1">SCHEMA</span>
                    <div className="font-mono text-xs whitespace-pre-wrap text-slate-800 overflow-x-auto leading-relaxed">
                      {item.diagram}
                    </div>
                </div>
              </div>

              {/* Bottom Dock Control Pill */}
              <div className="fixed bottom-8 right-8 bg-slate-900 text-slate-300 rounded-full flex items-center shadow-2xl border border-slate-700 font-mono text-xs overflow-hidden">
                <button onClick={onPrev} className="px-6 py-3 hover:bg-slate-800 transition-colors uppercase select-none active:bg-black border-r border-slate-700">
                  [Prev]
                </button>
                <button onClick={onNext} className="px-6 py-3 hover:bg-slate-800 transition-colors uppercase select-none active:bg-black border-r border-slate-700">
                  [Next]
                </button>
                <button onClick={onClose} className="px-6 py-3 hover:bg-slate-800 transition-colors uppercase font-bold text-white select-none active:bg-black">
                  [Close]
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
