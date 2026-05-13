import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FoodCarousel from './pages/FoodCarousel';
import MemoryArchive from './pages/MemoryArchive';
import Main1 from './pages/Main1';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main1 />} />
        <Route path="/food" element={<FoodCarousel />} />
        <Route path="/memory" element={<MemoryArchive />} />
      </Routes>
    </BrowserRouter>
  );
}
