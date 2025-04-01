import { defineConfig } from 'vite'
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), themePlugin(), runtimeErrorOverlay()],
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '/src/shared',
      '@assets': '/src/assets',
    },
  },
})
