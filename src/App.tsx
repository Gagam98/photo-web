import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FoodCarousel from './pages/FoodCarousel';
import MemoryArchive from './pages/MemoryArchive';
import Main from './pages/Main';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/food" element={<FoodCarousel />} />
        <Route path="/memory" element={<MemoryArchive />} />
      </Routes>
    </BrowserRouter>
  );
}
