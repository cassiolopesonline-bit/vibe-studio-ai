import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Permite que o site abra no Render
    allowedHosts: ['vibe-studio-ai.onrender.com'],
    host: true,
    port: 10000
  }
});
