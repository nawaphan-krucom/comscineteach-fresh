import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('exceljs')) return 'vendor-exceljs';
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'vendor-chartjs';
            if (id.includes('pdfkit')) return 'vendor-pdfkit';
            if (id.includes('fuse.js')) return 'vendor-fuse';
            if (id.includes('lodash-es')) return 'vendor-lodash';
            return 'vendor';
          }
        }
      }
    }
  }
});