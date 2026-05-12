import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PhotoCarousel from './pages/PhotoCarousel';
import Main from './pages/Main';
import Main1 from './pages/Main1';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main1 />} />
        <Route path="/photo" element={<PhotoCarousel />} />
        <Route path="/main" element={<Main />} />
        <Route path="/main1" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
