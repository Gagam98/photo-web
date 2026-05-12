import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const AboutTeaser = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="py-32 px-6 lg:px-12 relative overflow-hidden bg-sky-50 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <motion.div style={{ y, opacity }} className="space-y-12">
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold uppercase tracking-tight leading-tight">
            With <span className="text-blue-500">Emotion</span> + <br/>
            Innovation, We push <br/>
            the boundaries of <br/>
            <span className="text-emerald-500">digital creativity.</span>
          </h2>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pt-12 border-t border-sky-200">
            <p className="max-w-lg text-lg text-gray-600">
              We are a founder-led Scottish born, global digital marketing, branding & web design agency. Every brand has a story, from startups finding their voice to titans refining their legacy. We ensure that tale shines brilliantly.
            </p>
            <a href="#" className="flex items-center gap-2 group text-sm font-bold uppercase tracking-widest hover:text-blue-500 transition-colors">
              About Us
              <span className="group-hover:translate-x-1 transition-transform">-&gt;</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
