/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/uri-entdecker/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png', 'icons/favicon-32.png', 'icons/favicon-48.png'],
      manifest: {
        id: '/uri-entdecker/',
        start_url: '/uri-entdecker/',
        scope: '/uri-entdecker/',
        name: 'Uri-Entdecker',
        short_name: 'Uri-Entdecker',
        description: 'Kanton Uri spielend entdecken',
        lang: 'de-CH',
        display: 'standalone',
        orientation: 'any',
        background_color: '#CFEFFF',
        theme_color: '#FFC928',
        icons: [
          { src: '/uri-entdecker/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/uri-entdecker/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: '/uri-entdecker/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,json,geojson,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
  },
});
