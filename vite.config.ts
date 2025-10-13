import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueJsx(),
  ],
  
  build: {
    outDir: 'dist',
    emptyOutDir: true, // Очищает папку перед сборкой
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

  // server: { это тоже рабочий конфиг
  //   host: '0.0.0.0',
  //   port: 5173,
  //   strictPort: false ,
  //   proxy: {
  //     '/api': {
  //       target: 'http://192.168.0.103:8080',
  //       changeOrigin: true,
  //       secure: false,
  //     }
  //   }
  // }

   server: {
    host: '0.0.0.0', // правильно - разрешаем все подключения
    port: 5173,
    strictPort: false,
    // Добавьте эту настройку для корректной работы с Hamachi
    hmr: {
      host: 'localhost', // для HMR оставляем localhost
      protocol: 'ws'
    },
    proxy: {
      '/api': {
        target: 'http://192.168.0.103:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
