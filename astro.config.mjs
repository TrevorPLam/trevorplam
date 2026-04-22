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
    csp: {
      directives: [
        "default-src 'self'",
        "script-src 'self' https://plausible.io",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://plausible.io",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'"
      ]
    }
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
