import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Activity, Lightbulb, X, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface OnboardingModalProps {
  theme: 'light' | 'dark';
}

export function OnboardingModal({ theme }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative w-full max-w-md p-6 rounded-2xl shadow-2xl border flex flex-col gap-5",
              theme === 'dark' ? "bg-[#161921] border-white/10" : "bg-white border-slate-200"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className={cn(
                "absolute top-4 right-4 p-1.5 rounded-lg transition-colors",
                theme === 'dark' ? "text-slate-400 hover:bg-white/10" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Zap className="text-indigo-500" size={20} />
              </div>
              <div>
                <h2 className={cn("text-lg font-black tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>Selamat Datang di AI Forex Pro</h2>
                <p className={cn("text-xs font-medium", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>Platform Analisa Sinyal Trading AI</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex gap-3">
                <div className="w-8 flex justify-center shrink-0">
                  <Activity className="text-emerald-500 mt-0.5" size={18} />
                </div>
                <div>
                  <h3 className={cn("text-sm font-bold", theme === 'dark' ? "text-slate-200" : "text-slate-800")}>Fitur Utama</h3>
                  <p className={cn("text-xs leading-relaxed mt-1", theme === 'dark' ? "text-slate-400" : "text-slate-600")}>Analisis multi-AI menggunakan Gemini, Llama, GPT-4o, dan Claude dengan dukungan sentimen pasar real-time dari Finnhub & Twitter.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 flex justify-center shrink-0">
                  <Lightbulb className="text-amber-500 mt-0.5" size={18} />
                </div>
                <div>
                  <h3 className={cn("text-sm font-bold", theme === 'dark' ? "text-slate-200" : "text-slate-800")}>Cara Membaca Sinyal</h3>
                  <p className={cn("text-xs leading-relaxed mt-1", theme === 'dark' ? "text-slate-400" : "text-slate-600")}>Klik <b>Analisa</b> pada panel pair mata uang. AI akan merekomendasikan Buy, Sell, atau Hold lengkap dengan level TP (Take Profit) dan SL (Stop Loss) berdasarkan algoritma kuantitatif.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 flex justify-center shrink-0">
                  <ShieldAlert className="text-rose-500 mt-0.5" size={18} />
                </div>
                <div>
                  <h3 className={cn("text-sm font-bold", theme === 'dark' ? "text-slate-200" : "text-slate-800")}>Peringatan Risiko</h3>
                  <p className={cn("text-xs leading-relaxed mt-1", theme === 'dark' ? "text-slate-400" : "text-slate-600")}>Trading forex berisiko tinggi dan dapat mengakibatkan kerugian dana. Sinyal AI hanya sebagai alat bantu analisis, bukan saran finansial pasti. Selalu gunakan manajemen risiko minimum.</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="mt-4 w-full py-3 px-4 rounded-xl font-bold text-sm bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] transition-all text-white shadow-lg shadow-indigo-500/20 tracking-wide"
            >
              Saya Mengerti & Mulai Trading
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
