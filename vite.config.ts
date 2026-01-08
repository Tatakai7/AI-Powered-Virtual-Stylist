import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 3001,
    proxy: {
      '/auth': {
        target: 'https://kfoytstbhqiqaldkwoqb.supabase.co',
        changeOrigin: true,
      },
      '/rest': {
        target: 'https://kfoytstbhqiqaldkwoqb.supabase.co',
        changeOrigin: true,
      },
      '/storage': {
        target: 'https://kfoytstbhqiqaldkwoqb.supabase.co',
        changeOrigin: true,
      },
      '/realtime': {
        target: 'https://kfoytstbhqiqaldkwoqb.supabase.co',
        changeOrigin: true,
      },
    },
  },
});
