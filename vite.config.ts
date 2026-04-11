import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // ISSO AQUI DIZ AO VITE ONDE ESTÁ O INDEX.HTML
  root: 'src',
  build: {
    // ISSO DIZ ONDE SALVAR O SITE PRONTO
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    allowedHosts: true,
    host: true,
    port: 10000
  }
});
