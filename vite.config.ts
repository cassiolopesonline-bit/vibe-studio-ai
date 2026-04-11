import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Isso aqui libera o acesso total no Render
    allowedHosts: true,
    host: true,
    port: 10000
  }
});
