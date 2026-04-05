import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Isso aqui é a "chave mestra" que libera o acesso de qualquer lugar
    allowedHosts: true,
    host: true,
    port: 10000
  }
});
