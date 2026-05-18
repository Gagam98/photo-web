import { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import TrafficLightPole from '../components/TrafficLightPole';

export default function Main() {
  const navigate = useNavigate();

  return (
    // We use a dark background to make the AdditiveBlending neon signs pop brilliantly
    <div className="relative w-full h-[100dvh] bg-[#0a0a0a] overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing">
      
      {/* Premium Minimalist Top Navigation */}
      <header className="absolute top-0 left-0 w-full z-20 flex justify-between items-center px-8 md:px-16 py-8 pointer-events-none">
        {/* Brand Logo / Home */}
        <div 
          onClick={() => navigate('/')} 
          className="text-white font-mono text-xs tracking-[0.3em] font-medium cursor-pointer pointer-events-auto hover:opacity-80 transition-opacity"
        >
          Choi yun young
        </div>

        {/* Categories Nav Links */}
        <nav className="flex gap-6 md:gap-10 items-center pointer-events-auto">
          {[
            { id: '01', name: 'FOOD', path: '/food' },
            { id: '02', name: 'MUSEUM', path: '/museum' },
            { id: '03', name: 'MEMORY', path: '/memory' },
            { id: '04', name: 'GAME', path: '/game' }
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(item.path)}
              className="group relative flex items-baseline gap-1.5 cursor-pointer text-white/50 hover:text-white transition-all duration-300 font-mono text-[10px] md:text-[11px] tracking-[0.25em]"
            >
              <span className="text-[8px] opacity-40 font-light group-hover:text-white/60 transition-colors">{item.id}</span>
              <span className="font-bold">{item.name}</span>
              
              {/* Sleek active/hover underline indicator */}
              <span className="absolute -bottom-1.5 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>
          ))}
        </nav>
      </header>

      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} className="z-10">
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 5, 5]} intensity={0.5} />
        
        {/* Soft environment map for the metallic pole reflections */}
        <Environment preset="city" />

        <Suspense fallback={null}>
          <TrafficLightPole 
            onLightClick={() => navigate('/food')} 
            onMemoryClick={() => navigate('/memory')}
            onMuseumClick={() => navigate('/museum')}
            onGameClick={() => navigate('/game')}
          />
          
          {/* Subtle ground shadow for depth */}
          <ContactShadows position={[0, -6, 0]} opacity={0.4} scale={20} blur={2} far={10} />
        </Suspense>

        <OrbitControls 
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
        />
      </Canvas>

      {/* Decorative background glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 opacity-20">
        <div className="w-[800px] h-[800px] bg-gradient-to-tr from-purple-500/30 via-transparent to-orange-500/30 rounded-full blur-[120px]" />
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 tracking-widest text-xs font-bold uppercase pointer-events-none">
        드래그하여 살펴보기
      </div>
    </div>
  );
}
