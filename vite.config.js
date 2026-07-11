import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Custom SW (src/sw.js): workbox precaching + push notification handlers
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Daily Shenanigans',
        short_name: 'Shenanigans',
        description: 'Diário de pesquisa + treino de calistenia (L5-S1 friendly)',
        lang: 'pt-BR',
        start_url: '/DailyShenanigans/',
        scope: '/DailyShenanigans/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f0f7f0',
        theme_color: '#2e7d32',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
    }),
  ],
  base: '/DailyShenanigans/',
})
