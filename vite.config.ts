import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // <-- Quan trọng!
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});