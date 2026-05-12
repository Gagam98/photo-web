

export const Footer = () => {
  return (
    <footer className="bg-sky-50 text-gray-900 pt-32 pb-12 px-6 lg:px-12 border-t border-sky-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 border-b border-sky-200 pb-20">
        <div>
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-8 max-w-sm leading-tight text-gray-800">
            Elevating Brands in Unexpected Ways.
          </h2>
          <a href="#" className="inline-flex border items-center justify-center border-gray-300 hover:bg-sky-100 hover:text-sky-700 hover:border-sky-300 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-all">
            Get in touch -&gt;
          </a>
        </div>
        
        <div className="flex gap-16 md:gap-32">
          <div className="space-y-4">
            <h4 className="text-sky-600 text-xs font-bold uppercase tracking-widest mb-6 border-b border-sky-200 pb-4">Sitemap</h4>
            <div className="flex flex-col space-y-3 text-sm font-medium uppercase tracking-wider">
              <a href="#" className="hover:text-blue-500 transition-colors">Home</a>
              <a href="#" className="hover:text-blue-500 transition-colors">About Us</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Work</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Services</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sky-600 text-xs font-bold uppercase tracking-widest mb-6 border-b border-sky-200 pb-4">Connect</h4>
            <div className="flex flex-col space-y-3 text-sm font-medium uppercase tracking-wider">
              <a href="#" className="hover:text-blue-500 transition-colors">Twitter</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Instagram</a>
              <a href="#" className="hover:text-blue-500 transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto flex justify-between items-center text-xs text-slate-500 uppercase tracking-widest pt-8">
        <p>© 2026 OFF+BRAND.</p>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
          <a href="#" className="hover:text-blue-500 transition-colors">Careers</a>
        </div>
      </div>
    </footer>
  );
};
