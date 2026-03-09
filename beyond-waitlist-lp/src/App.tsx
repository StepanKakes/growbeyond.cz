import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VideoSection } from './components/VideoSection';
import { Testimonials } from './components/Testimonials';
import { ReviewWall } from './components/ReviewWall';
import { StarterPackOffer } from './components/StarterPackOffer';
import { StarterPackIntro } from './components/StarterPackIntro';
import { CreatorStarterPack } from './components/CreatorStarterPack';
import { TruthAboutBuilding } from './components/TruthAboutBuilding';
import { FAQ } from './components/FAQ';
import { HowWeTeach } from './components/HowWeTeach';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { TextureOverlay } from './components/TextureOverlay';
import { SmoothScroll } from './components/SmoothScroll';

export default function App() {
  return (
    <SmoothScroll>
      <main className="min-h-screen relative bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white">
        <Navbar />
        <TextureOverlay />
        <Hero />
        <VideoSection />
        <StarterPackIntro />
        <Testimonials />
        <CreatorStarterPack />
        <TruthAboutBuilding />
        <ReviewWall />
        <StarterPackOffer />
        <FAQ />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
