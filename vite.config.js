import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/RPM-agora-agent/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
