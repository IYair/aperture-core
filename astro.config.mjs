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
  integrations: [sitemap({
    customPages: [
      'https://aperturecore.com/',
      'https://aperturecore.com/servicios/',
      'https://aperturecore.com/casos/',
      'https://aperturecore.com/nosotros/',
      'https://aperturecore.com/contacto/',
      'https://aperturecore.com/faq/',
      'https://aperturecore.com/privacidad/'
    ],
    serialize(item) {
      // Prioridad y frecuencia de cambio por página
      const pageConfig = {
        '/': { priority: 1.0, changefreq: 'weekly' },
        '/servicios/': { priority: 0.9, changefreq: 'monthly' },
        '/casos/': { priority: 0.8, changefreq: 'monthly' },
        '/nosotros/': { priority: 0.7, changefreq: 'monthly' },
        '/contacto/': { priority: 0.8, changefreq: 'monthly' },
        '/faq/': { priority: 0.6, changefreq: 'monthly' },
        '/privacidad/': { priority: 0.3, changefreq: 'yearly' },
        '/error/': { priority: 0.1, changefreq: 'yearly' },
        '/gracias/': { priority: 0.1, changefreq: 'yearly' }
      };

      const path = new URL(item.url).pathname;
      // @ts-ignore - Dynamic path lookup for sitemap configuration
      const config = pageConfig[path] || { priority: 0.5, changefreq: 'monthly' };

      return {
        ...item,
        priority: config.priority,
        changefreq: config.changefreq,
        lastmod: new Date().toISOString()
      };
    }
  })],
  vite: {
    plugins: [tailwindcss()]
  }
});