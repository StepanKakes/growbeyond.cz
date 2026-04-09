import { Hero } from '../components/Hero';
import { VideoSection } from '../components/VideoSection';
import { FadeUp } from '../components/FadeUp';
import { StarterPackIntro } from '../components/StarterPackIntro';
import { Testimonials } from '../components/Testimonials';
import { CreatorStarterPack } from '../components/CreatorStarterPack';
import { TruthAboutBuilding } from '../components/TruthAboutBuilding';
import { ReviewWall } from '../components/ReviewWall';
import { StarterPackOffer } from '../components/StarterPackOffer';
import { FAQ } from '../components/FAQ';

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="-mt-[60dvh] md:-mt-[50dvh] flex flex-col items-center justify-center pb-24 px-4 relative z-20 bg-transparent pt-12">
          <div className="max-w-[1400px] mx-auto w-full">
              <div className="max-w-5xl mx-auto relative">
                  <div className="text-center mb-8 md:mb-12">
                      <FadeUp>
                          <h2 className="text-[32px] md:text-[48px] lg:text-[56px] font-bold text-white tracking-tight-custom leading-[1]">
                              Tohle <span className="font-serif italic font-normal text-brand-red">potřebuješ</span> slyšet...
                          </h2>
                      </FadeUp>
                  </div>
                  
                  <div className="w-full relative z-20">
                     <VideoSection />
                  </div>

                  <div className="mt-12 flex justify-center">
                    <FadeUp translateY={20}>
                        <a href="#starterpackoffer" className="bg-[#FF0E00] hover:bg-[#cc0b00] text-white px-10 md:px-14 py-4 rounded-full text-lg md:text-xl font-bold tracking-tight-custom transition-all inline-block shadow-lg shadow-brand-red/20 uppercase hover:scale-105">
                            Jdu do toho
                        </a>
                    </FadeUp>
                  </div>
              </div>
          </div>
      </section>
      <StarterPackIntro />
      <Testimonials />
      <CreatorStarterPack />
      <TruthAboutBuilding />
      <ReviewWall />
      <StarterPackOffer />
      <FAQ />
    </>
  );
}
