import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
        secure: false,
        // Ne pas supprimer le préfixe /api
        rewrite: (path) => path
      }
    },
    port: 5174,
    strictPort: true,
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
