
import { motion, useScroll, useTransform } from 'framer-motion';

export const Navbar = () => {
  const { scrollY } = useScroll();
  const background = useTransform(
    scrollY,
    [0, 50],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.85)']
  );
  const backdropFilter = useTransform(
    scrollY,
    [0, 50],
    ['blur(0px)', 'blur(10px)']
  );

  return (
    <motion.nav 
      style={{ background, backdropFilter }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 lg:px-12 transition-all duration-300"
    >
      <div className="text-xl md:text-2xl font-bold tracking-tighter uppercase whitespace-nowrap">
        OFF+BRAND.
      </div>
      
      <div className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide uppercase text-gray-700">
        <a href="#" className="hover:text-blue-500 transition-colors">Manifesto</a>
        <a href="#" className="hover:text-blue-500 transition-colors">About Us</a>
        <a href="#" className="hover:text-blue-500 transition-colors">Work</a>
        <a href="#" className="hover:text-blue-500 transition-colors">Services</a>
      </div>

      <div className="flex items-center">
        <a href="#" className="border border-gray-300 hover:border-blue-300 hover:bg-blue-50 px-5 py-2.5 rounded-full text-sm font-medium uppercase tracking-wide transition-all text-gray-900">
          Contact -&gt;
        </a>
      </div>
    </motion.nav>
  );
};
