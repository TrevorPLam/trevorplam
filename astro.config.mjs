import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  output: 'static',
  site: 'https://trevor-lam.com',
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [
      tailwindcss(),
      // Bundle analyzer - only enabled when ANALYZE environment variable is set
      process.env.ANALYZE ? visualizer({
        filename: 'reports/bundle-analysis.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }) : null
    ].filter(Boolean)
  },
  security: {
    csp: true
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-sans',
      weights: ['400', '600', '700']
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      weights: ['400', '500']
    }
  ]
});
