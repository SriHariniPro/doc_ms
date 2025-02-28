import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
      worker_threads: false,
      '@': path.resolve(__dirname, './src'),
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
      },
      plugins: [
        {
          name: 'node-globals',
          setup(build) {
            build.onResolve({ filter: /^(fs|path)$/ }, args => {
              return { path: false }
            })
          }
        }
      ]
    },
    include: ['pdf-parse', 'mammoth']
  },
  build: {
    rollupOptions: {
      external: ['fs', 'path', 'util', 'crypto'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-slot', 'clsx', 'lucide-react', 'tailwind-merge']
        }
      }
    }
  }
})
