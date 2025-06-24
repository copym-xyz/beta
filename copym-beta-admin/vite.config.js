import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,     // 👈 Change to 5174
    host: true,     // 👈 Optional: allows LAN access
  },
});
