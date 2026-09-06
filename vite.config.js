import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: { exclude: ['peerjs'] },
  build: { commonjsOptions: { include: [/peerjs/, /node_modules/] } },
  server: {
    allowedHosts: true,
  },
})
