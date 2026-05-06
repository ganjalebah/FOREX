import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY),
      'process.env.X_API_KEY': JSON.stringify(env.X_API_KEY),
      'process.env["X-Finnhub-Secret"]': JSON.stringify(env["X-Finnhub-Secret"]),
      'process.env.ExchangeRate_API_KEY': JSON.stringify(env.ExchangeRate_API_KEY),
      'process.env.VITE_TWELVE_DATA_KEYS': JSON.stringify(env.VITE_TWELVE_DATA_KEYS),
      'process.env.VITE_TWELVEDATA_API_KEY': JSON.stringify(env.VITE_TWELVEDATA_API_KEY),
      'process.env.VITE_TWELVEDATA_API_KEY_1': JSON.stringify(env.VITE_TWELVEDATA_API_KEY_1),
      'process.env.VITE_TWELVEDATA_API_KEY_2': JSON.stringify(env.VITE_TWELVEDATA_API_KEY_2),
      'process.env.VITE_TWELVEDATA_API_KEY_3': JSON.stringify(env.VITE_TWELVEDATA_API_KEY_3),
      'process.env.VITE_TWELVEDATA_API_KEY_4': JSON.stringify(env.VITE_TWELVEDATA_API_KEY_4),
      'process.env.VITE_TWELVEDATA_API_KEY_5': JSON.stringify(env.VITE_TWELVEDATA_API_KEY_5),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
