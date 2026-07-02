"use client";

import React, { useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { instrumentSerif } from "@/app/fonts";

function LoginForm() {
  const [pins, setPins] = useState(['', '', '', '']);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/sop';
  // Interní systémy (links, leads) mají oddělený PIN i přihlašovací scope.
  // SOP knihovna používá 4místný PIN, interní systémy běžné heslové pole.
  const isInternal = from.startsWith('/links') || from.startsWith('/leads');
  const scope = isInternal ? 'internal' : 'sop';
  const title = isInternal ? 'Interní systémy' : 'SOP Knihovna';

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  const handleInputChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newPins = [...pins];
    newPins[index] = value.slice(-1);
    setPins(newPins);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-login trigger when all fields are filled
    if (newPins.every(p => p !== '') && !isLoading) {
      handleLogin(newPins.join(''));
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

  const handleLogin = async (explicitPin?: string) => {
    const pin = explicitPin ?? (isInternal ? password : pins.join(''));
    const minLen = isInternal ? 1 : 4;
    if (pin.length < minLen || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sop/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, scope }),
      });

      const data = await res.json();

      if (data.success) {
        window.location.href = from;
      } else {
        setError(data.error || 'Neplatné heslo');
        if (isInternal) {
          setPassword('');
        } else {
          setPins(['', '', '', '']);
          inputRefs[0].current?.focus();
        }
      }
    } catch (err) {
      setError('Server Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm relative z-10">
      <div className="text-center mb-12">
        <h2 className={`${instrumentSerif.className} italic text-5xl text-white mb-4 tracking-tight`}>
          Beyond
        </h2>
        <h1 className="text-lg font-bold text-white uppercase tracking-[0.2em] mb-1">
           {title}
        </h1>
      </div>

      <div className="bg-[#0d0d0d] border border-white/[0.05] rounded-[32px] p-10 shadow-2xl">
        {isInternal ? (
          <div className="mb-10">
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
              placeholder="Heslo"
              className="w-full h-16 bg-white/[0.02] border border-white/[0.08] rounded-2xl text-center text-xl font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-brand-red/50 focus:bg-white/[0.04] transition-all"
            />
          </div>
        ) : (
          <div className="flex justify-center gap-3.5 mb-10">
            {pins.map((p, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="password"
                autoFocus={i === 0}
                maxLength={1}
                inputMode="numeric"
                pattern="\d*"
                value={p}
                onChange={(e) => handleInputChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-14 h-16 bg-white/[0.02] border border-white/[0.08] rounded-2xl text-center text-3xl font-black text-white focus:outline-none focus:border-brand-red/50 focus:bg-white/[0.04] transition-all select-none"
              />
            ))}
          </div>
        )}

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
          disabled={isLoading || (isInternal ? password === '' : pins.some(p => p === ''))}
          className="w-full bg-brand-red hover:bg-brand-red/90 disabled:opacity-10 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-red/10 group"
        >
          {isLoading ? (
             <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
             'VSTOUPIT'
          )}
        </button>
      </div>
    </div>
  );
}

export default function SOPLoginPage() {
  return (
    <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white/10 animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
