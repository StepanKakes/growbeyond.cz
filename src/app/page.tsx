export default function Home() {
  return (
    <main className="w-full h-screen relative flex items-center justify-center overflow-hidden">

      {/* 
        Text Layer
        Updated to use Red (#FF0E00) to stand out against the grayscale background.
      */}
      <div className="relative z-50 pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-serif tracking-[0.1em] text-[#FF0E00] uppercase text-center opacity-90 drop-shadow-lg">
          Do you see me?
        </h1>
      </div>

    </main>
  );
}
