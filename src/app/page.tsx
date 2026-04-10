"use client";

import dynamic from 'next/dynamic';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Testimonials } from '@/components/Testimonials';
import { ReviewWall } from '@/components/ReviewWall';
import { StarterPackOffer } from '@/components/StarterPackOffer';
import { CountdownBanner } from '@/components/CountdownBanner';
import { StarterPackIntro } from '@/components/StarterPackIntro';
import { CreatorStarterPack } from '@/components/CreatorStarterPack';
import { TruthAboutBuilding } from '@/components/TruthAboutBuilding';
import { FAQ } from '@/components/FAQ';
import { HowWeTeach } from '@/components/HowWeTeach';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';
import { TextureOverlay } from '@/components/TextureOverlay';

const SmoothScroll = dynamic(() => import('@/components/SmoothScroll').then(mod => mod.SmoothScroll), { ssr: false });
const VideoSection = dynamic(() => import('@/components/VideoSection').then(mod => mod.VideoSection), { ssr: false });


export default function Home() {
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
        <CountdownBanner />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
