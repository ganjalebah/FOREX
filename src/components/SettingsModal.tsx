import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Link2, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { getTranslation } from '../lib/i18n';

interface SettingsModalProps {
  theme: 'light' | 'dark';
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export function SettingsModal({ theme, isOpen, onClose, lang }: SettingsModalProps) {
  const [brokerType, setBrokerType] = useState('metaapi');
  const [apiKey, setApiKey] = useState('');
  const [accountId, setAccountId] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load existing settings
    const savedType = localStorage.getItem('broker_type');
    const savedKey = localStorage.getItem('broker_api_key');
    const savedAccount = localStorage.getItem('broker_account_id');
    
    if (savedType) setBrokerType(savedType);
    if (savedKey) setApiKey(savedKey);
    if (savedAccount) setAccountId(savedAccount);
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('broker_type', brokerType);
    localStorage.setItem('broker_api_key', apiKey);
    localStorage.setItem('broker_account_id', accountId);
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
            onClick={onClose}
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
              onClick={onClose}
              className={cn(
                "absolute top-4 right-4 p-1.5 rounded-lg transition-colors",
                theme === 'dark' ? "text-slate-400 hover:bg-white/10" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Settings className="text-indigo-500" size={20} />
              </div>
              <div>
                <h2 className={cn("text-lg font-black tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
                  Pengaturan
                </h2>
                <p className={cn("text-xs font-medium", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>
                  Integrasi Akun Broker & API
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <div className={cn(
                "p-3 rounded-lg border text-xs leading-relaxed flex gap-3",
                theme === 'dark' ? "bg-amber-500/10 border-amber-500/20 text-amber-200" : "bg-amber-50 border-amber-200 text-amber-800"
              )}>
                <ShieldAlert size={16} className="shrink-0 mt-0.5 text-amber-500" />
                <p>
                  Integrasi ini memungkinkan aplikasi untuk mengeksekusi order Buy/Sell langsung ke broker Anda. 
                  Gunakan akun Demo jika Anda baru pertama kali mengatur ini.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={cn("text-xs font-bold uppercase", theme === 'dark' ? "text-slate-400" : "text-slate-600")}>
                  Penyedia API Broker
                </label>
                <select
                  value={brokerType}
                  onChange={(e) => setBrokerType(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-indigo-500",
                    theme === 'dark' ? "bg-[#0B0E11] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  )}
                >
                  <option value="metaapi">MetaApi (MT4/MT5)</option>
                  <option value="oanda">OANDA REST API</option>
                  <option value="ctrader">cTrader Open API</option>
                  <option value="ig">IG Markets</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={cn("text-xs font-bold uppercase", theme === 'dark' ? "text-slate-400" : "text-slate-600")}>
                  API Key / Token
                </label>
                <div className="relative">
                  <KeyRound size={16} className={cn("absolute left-3 top-1/2 -translate-y-1/2", theme === 'dark' ? "text-slate-500" : "text-slate-400")} />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Masukkan token akses API"
                    className={cn(
                      "w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-indigo-500",
                      theme === 'dark' ? "bg-[#0B0E11] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={cn("text-xs font-bold uppercase", theme === 'dark' ? "text-slate-400" : "text-slate-600")}>
                  Account ID
                </label>
                <div className="relative">
                  <Link2 size={16} className={cn("absolute left-3 top-1/2 -translate-y-1/2", theme === 'dark' ? "text-slate-500" : "text-slate-400")} />
                  <input
                    type="text"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder="ID Akun Trading"
                    className={cn(
                      "w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-indigo-500",
                      theme === 'dark' ? "bg-[#0B0E11] border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    )}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className={cn(
                "mt-2 w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all shadow-lg text-white flex items-center justify-center gap-2",
                isSaved ? "bg-emerald-500 shadow-emerald-500/20" : "bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] shadow-indigo-500/20"
              )}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 size={18} /> Tersimpan
                </>
              ) : (
                "Simpan Konfigurasi"
              )}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
