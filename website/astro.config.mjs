// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://uintawatch.com',
  integrations: [
    sitemap({
      namespaces: {
        news: false,
        xhtml: false,
        image: false,
        video: false,
      },
    }),
  ],
  fonts: [
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'DM Serif Display',
      cssVariable: '--font-display',
      fallbacks: ['Georgia', 'serif'],
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
    },
    {
      provider: fontProviders.npm({ remote: false }),
      name: 'Archivo',
      cssVariable: '--font-body',
      fallbacks: ['system-ui', 'sans-serif'],
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
    },
  ],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  },
  vite: {
    plugins: [tailwindcss()]
  },
});