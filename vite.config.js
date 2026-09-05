import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // buat ngrok — uncomment kalau mau pakai:
    // allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.io'],
    allowedHosts: true,
  },
})
