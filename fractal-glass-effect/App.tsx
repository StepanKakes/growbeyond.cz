import React from 'react';
import { FractalCanvas } from './components/FractalCanvas';

const App: React.FC = () => {
  return (
    <main className="w-full h-screen relative flex items-center justify-center overflow-hidden bg-[#111111]">
      {/* The Interactive Layer (Dynamic Gradient + Fractal Glass) */}
      <FractalCanvas />
    </main>
  );
};

export default App;