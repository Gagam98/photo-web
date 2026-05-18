import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FoodCarousel from './pages/FoodCarousel';
import MemoryArchive from './pages/MemoryArchive';
import Main from './pages/Main';
import Museum from './pages/Museum';
import Game from './pages/Game';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/food" element={<FoodCarousel />} />
        <Route path="/memory" element={<MemoryArchive />} />
        <Route path="/museum" element={<Museum />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}
