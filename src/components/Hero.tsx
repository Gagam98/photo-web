
import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <section className="relative h-screen flex flex-col justify-center px-6 lg:px-12 pt-20 overflow-hidden">
      <div className="z-10 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-2"
        >
          <h1 className="heading-xl text-gray-900">A different</h1>
          <h1 className="heading-xl text-blue-400">Creative</h1>
          <h1 className="heading-xl text-gray-900">approach</h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-12 left-6 lg:left-12 flex items-center justify-center w-12 h-12 border border-gray-300 text-gray-400 hover:bg-blue-100 hover:text-blue-600 rounded-full transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </motion.div>
      </div>

      {/* Background abstract element mimicking WebGL/3D feeling */}
      <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-gradient-to-l from-emerald-300/30 to-blue-300/40 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
};
