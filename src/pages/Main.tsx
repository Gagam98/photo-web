import React from 'react';
import { motion } from 'framer-motion';
import AbstractPerson from '../components/AbstractPerson';

export default function Main() {
  return (
    <div className="w-full min-h-[100dvh] bg-[#050505] overflow-hidden relative font-sans text-white flex flex-col items-center justify-center">
      
      {/* Dynamic Background Noise / Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header / Title area */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute top-10 md:top-16 left-0 right-0 flex flex-col items-center z-20 pointer-events-none"
      >
        <h1 className="text-3xl md:text-5xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600 drop-shadow-2xl mb-2">
          Human Interface
        </h1>
        <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent mb-4" />
        <p className="text-zinc-500 text-xs md:text-sm tracking-[0.3em] font-medium uppercase">
          Explore The Components
        </p>
      </motion.div>

      {/* Main Interactive Element */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="z-10 w-full"
      >
        <AbstractPerson />
      </motion.div>

      {/* Footer / Info area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-10 left-0 right-0 flex justify-center z-20 pointer-events-none"
      >
        <div className="flex items-center gap-2 text-zinc-600 text-[10px] md:text-xs uppercase tracking-[0.2em]">
          <span className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse" />
          System Online
        </div>
      </motion.div>
    </div>
  );
}
