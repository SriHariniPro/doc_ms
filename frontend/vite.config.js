import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      stream: 'stream-browserify',
      path: 'path-browserify',
      util: 'util',
      crypto: 'crypto-browserify',
    },
  },
  define: {
    'process.env': {},
    global: {},
  },
})
