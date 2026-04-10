"use client";

import dynamic from 'next/dynamic';
import { Navbar } from '@/components/Navbar';
import { CoachingHero } from '@/components/CoachingHero';
import { Testimonials } from '@/components/Testimonials';
import { TextureOverlay } from '@/components/TextureOverlay';
import { CallBenefits } from '@/components/mentorship/CallBenefits';
import { ScreenshotGallery } from '@/components/mentorship/ScreenshotGallery';

const SmoothScroll = dynamic(() => import('@/components/SmoothScroll').then(mod => mod.SmoothScroll), { ssr: false });
const MentorshipVideoSection = dynamic(() => import('@/components/mentorship/MentorshipVideoSection').then(mod => mod.MentorshipVideoSection), { ssr: false });
const ApplicationForm = dynamic(() => import('@/components/mentorship/ApplicationForm').then(mod => mod.ApplicationForm), { ssr: false });

export default function HomePage() {
    return (
        <SmoothScroll>
            <main className="min-h-screen relative bg-brand-dark text-white font-sans selection:bg-brand-red selection:text-white">
                <Navbar />
                <TextureOverlay />

                <CoachingHero />

                <div className="pt-12 sm:pt-16 pb-12 relative overflow-visible">
                    <div className="w-full max-w-[95vw] md:max-w-[55vw] lg:max-w-[1100px] mx-auto relative">
                        <img 
                            src="/images/krok1.svg" 
                            alt="Krok 1: Podívej se na video" 
                            className="absolute -top-8 sm:-top-12 md:-top-16 left-[-10px] sm:left-[2%] md:left-[5%] w-[220px] sm:w-[280px] md:w-[380px] z-30 pointer-events-none"
                        />
                        <div className="relative z-20">
                            <MentorshipVideoSection />
                        </div>
                    </div>
                </div>

                <div id="apply" className="pt-12 pb-24 relative overflow-visible">
                    <div className="w-full max-w-[95vw] md:max-w-[70vw] lg:max-w-[1000px] mx-auto relative px-4">
                        <ApplicationForm />
                        <img 
                            src="/images/krok2.svg" 
                            alt="Krok 2" 
                            className="absolute -top-4 sm:-top-6 md:-top-10 right-[-10px] sm:right-0 md:right-8 w-[300px] sm:w-[380px] md:w-[530px] z-30 pointer-events-none"
                        />
                    </div>
                </div>

                <CallBenefits />

                <div className="pt-12 flex flex-col items-center relative z-20 pb-16">
                    <a
                        href="#apply"
                        className="bg-brand-red hover:bg-[#cc0b00] text-white px-10 py-5 rounded-full text-lg md:text-xl font-bold tracking-tight-custom transition-all inline-block uppercase hover:scale-105"
                    >
                        JSEM READY RŮST
                    </a>
                </div>

                <Testimonials />

                <ScreenshotGallery />


            </main>
        </SmoothScroll>
    );
}
