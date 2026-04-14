"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { instrumentSerif } from "@/app/fonts";

export default function SOPLoginPage() {
  const [pins, setPins] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/sop';
  
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newPins = [...pins];
    // If the user pastes/types multiple characters, we only take the last one
    newPins[index] = value.slice(-1);
    setPins(newPins);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pins[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === 'Enter' && pins.every(p => p !== '')) {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    const pin = pins.join('');
    if (pin.length < 4) return;
    
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sop/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (data.success) {
        // Use location.href for full reload to ensure middleware catches it
        window.location.href = from;
      } else {
        setError(data.error || 'Neplatný PIN');
        setPins(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } catch (err) {
      setError('Server Error');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-submit when all 4 boxes are filled
  useEffect(() => {
    if (pins.every(p => p !== '')) {
      handleLogin();
    }
  }, [pins]);

  return (
    <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-red/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-12">
          <h2 className={`${instrumentSerif.className} italic text-5xl text-white mb-4 tracking-tight`}>
            Beyond
          </h2>
          <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black">
             SOP Library Access
          </p>
        </div>

        <div className="bg-[#0d0d0d] border border-white/[0.05] rounded-[32px] p-10 shadow-2xl">
          <div className="flex justify-center gap-3.5 mb-10">
            {pins.map((p, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="text"
                autoFocus={i === 0}
                maxLength={1}
                inputMode="numeric"
                pattern="\d*"
                value={p}
                onChange={(e) => handleInputChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-14 h-16 bg-white/[0.02] border border-white/[0.08] rounded-2xl text-center text-2xl font-black text-white focus:outline-none focus:border-brand-red/50 focus:bg-white/[0.04] transition-all select-none"
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-brand-red bg-brand-red/5 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest mb-6 border border-brand-red/10 text-center justify-center"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => handleLogin()}
            disabled={isLoading || pins.some(p => p === '')}
            className="w-full bg-brand-red hover:bg-brand-red/90 disabled:opacity-10 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-red/10 group"
          >
            {isLoading ? (
               <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
               'VSTOUPIT'
            )}
          </button>
        </div>

        <p className="text-center mt-12 text-[10px] text-white/5 font-black uppercase tracking-[0.4em]">
           Protected Access
        </p>
      </div>
    </main>
  );
}
