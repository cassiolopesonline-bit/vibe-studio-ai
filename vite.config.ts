import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  // Isso garante que os caminhos dos arquivos de estilo fiquem corretos
  base: '/',
  plugins: [react(), tailwindcss()],
  // Aponta para a pasta onde está seu index.html
  root: 'src',
  build: {
    // Salva o site pronto na pasta dist para o Render ler
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    allowedHosts: true,
    host: true,
    port: 10000
  }
});
