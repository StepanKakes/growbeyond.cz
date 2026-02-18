import { instrumentSerif, helvetica } from "@/app/fonts";
import { RotatingText } from "@/components/RotatingText";

export default function Home() {
  return (
    <main className="w-full h-screen relative flex flex-col items-center justify-center overflow-hidden bg-grain p-10">

      {/* Top Logo */}
      <div className="absolute top-12 left-10 lg:left-20 animate-reveal" style={{ animationDelay: '0.2s' }}>
        <span className={`${instrumentSerif.className} italic text-white text-3xl tracking-wide`}>
          Beyond
        </span>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <h1 className={`${helvetica.className} text-5xl md:text-8xl font-bold tracking-[-0.06em] text-white uppercase text-center animate-reveal`} style={{ animationDelay: '0.4s' }}>
          Coming Soon
        </h1>

        <div className="w-24 h-[1px] bg-white/20 animate-reveal" style={{ animationDelay: '0.6s' }} />

        <div className="w-full animate-reveal" style={{ animationDelay: '0.8s' }}>
          <RotatingText />
        </div>
      </div>

      {/* Aesthetic Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />

    </main>
  );
}
