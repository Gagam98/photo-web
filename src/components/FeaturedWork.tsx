
import { motion } from 'framer-motion';

const projects = [
  { name: 'Lando Norris', tags: 'Brand & Design', image: 'https://images.unsplash.com/photo-1541818224522-a5ec0c47d33d?q=80&w=600&auto=format&fit=crop' },
  { name: 'Vizcom', tags: 'Design / Development', image: 'https://images.unsplash.com/photo-1550537687-c91072c4792d?q=80&w=600&auto=format&fit=crop' },
  { name: 'Aether 1', tags: 'WebGL / 3d', image: 'https://images.unsplash.com/photo-1551009175-15bdf9f52f82?q=80&w=600&auto=format&fit=crop' },
  { name: 'Jasper', tags: 'Development / Rive', image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=600&auto=format&fit=crop' },
];

export const FeaturedWork = () => {
  return (
    <section className="py-32 px-6 lg:px-12 bg-white text-gray-900 rounded-t-[3rem] relative z-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-4">Featured work</h3>
            <h2 className="heading-lg">Trusted by<br/>Leaders</h2>
          </div>
          <a href="#" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest group hover:text-blue-500 transition-colors">
            All Work
            <span className="group-hover:translate-x-1 transition-transform">-&gt;</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {projects.map((project, index) => (
            <motion.div 
              key={project.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl mb-6 bg-gray-100">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full"
                >
                  <img src={project.image} alt={project.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                </motion.div>
                <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-md">
                    View Project
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold uppercase tracking-tight">{project.name}</h3>
                <p className="text-sm text-blue-500 font-medium uppercase tracking-widest max-w-[120px] text-right">{project.tags}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
