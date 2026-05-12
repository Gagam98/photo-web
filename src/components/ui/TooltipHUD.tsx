import { motion } from 'framer-motion';

export interface TooltipItem {
  name: string;
  category: string;
  stats: string;
}

interface TooltipHUDProps {
  item: TooltipItem | null;
  mouseX: number;
  mouseY: number;
}

export const TooltipHUD = ({ item, mouseX, mouseY }: TooltipHUDProps) => {
  if (!item) return null;

  return (
    <motion.div
      className="pointer-events-none fixed z-50 flex flex-col justify-center"
      style={{
        left: mouseX + 16,
        top: mouseY + 16,
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <div className="relative bg-black/40 backdrop-blur-md border border-white/30 text-white p-4 shadow-[0_0_20px_rgba(255,255,255,0.15)] w-72">
        {/* HUD Corner Decorators */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/80" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/80" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/80" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/80" />

        <div className="flex justify-between items-center border-b border-white/20 pb-2 mb-2">
          <span className="font-mono text-xs text-white/70 uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
            {item.category}
          </span>
          <span className="font-mono text-xs text-emerald-400">STATUS: ON</span>
        </div>
        
        <h3 className="font-sans font-bold text-lg uppercase tracking-wide mb-1 leading-tight">
          {item.name}
        </h3>
        
        <div className="mt-3 font-mono text-[10px] text-white/50 tracking-widest break-words leading-relaxed">
          {item.stats}
        </div>
      </div>
    </motion.div>
  );
};
