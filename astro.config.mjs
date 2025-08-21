// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://aperturecore.com',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});