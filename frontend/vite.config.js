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
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify/browser',
      buffer: 'buffer',
      process: 'process/browser',
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      worker_threads: false
    },
  },
  define: {
    'process.env': {},
    global: {},
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    },
    include: ['pdf-parse', 'mammoth']
  },
  build: {
    rollupOptions: {
      external: ['fs', 'net', 'tls', 'child_process', 'worker_threads'],
      output: {
        manualChunks: {
          'pdf-parse': ['pdf-parse'],
          'mammoth': ['mammoth']
        }
      }
    }
  }
})
