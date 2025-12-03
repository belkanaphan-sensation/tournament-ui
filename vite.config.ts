import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Загружаем переменные окружения
  const env = loadEnv(mode, process.cwd(), '')
  
  // Получаем URL из .env или используем значение по умолчанию
  const apiTarget = env.VITE_API_BASE_URL
  
  console.log(`🎯 API Target: ${apiTarget}`)
  console.log(`🌐 Mode: ${mode}`)

  return {
    plugins: [
      vue(),
      // vueJsx(),
    ],
    
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    },

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },

    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
      hmr: {
        host: 'localhost',
        protocol: 'ws'
      },
      proxy: {
        '/api': {
          target: apiTarget, // Используем переменную из .env
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})