import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { TextureOverlay } from './components/TextureOverlay';
import { SmoothScroll } from './components/SmoothScroll';
import HomePage from './pages/HomePage';
import MentorshipPage from './pages/MentorshipPage';

export default function App() {
  return (
    <Router>
      <SmoothScroll>
        <div className="min-h-screen relative bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white">
          <Navbar />
          <TextureOverlay />
          
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/mentorship" element={<MentorshipPage />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </SmoothScroll>
    </Router>
  );
}
