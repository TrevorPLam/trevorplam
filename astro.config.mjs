import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import pagefind from 'astro-pagefind';
import { visualizer } from 'rollup-plugin-visualizer';
import rehypeExternalLinks from './rehype-external-links.js';

export default defineConfig({
  output: 'static',
  site: 'https://trevor-lam.com',
  integrations: [
    mdx({
      rehypePlugins: [rehypeExternalLinks]
    }),
    sitemap(),
    pagefind()
  ],
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
    ].filter(Boolean),
    // 2026: Enhanced build optimization for Core Web Vitals
    build: {
      target: 'es2022', // Modern browser targeting
      minify: 'esbuild', // Faster minification
      sourcemap: process.env.NODE_ENV === 'development',
      cssMinify: true
    },
    css: {
      // Enable CSS code splitting for better performance
      devSourcemap: false
    },
    // 2026: Edge optimization configuration
    define: {
      // Enable edge-specific optimizations
      __EDGE_RUNTIME__: JSON.stringify(process.env.EDGE_RUNTIME || 'false')
    }
  },
  // Prefetch links for instant navigation
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },
  // Image optimization settings
  image: {
    // Use Sharp for image processing (faster than default)
    service: {
      entrypoint: 'astro/assets/services/sharp'
    },
    // 2026: AVIF format for superior compression (40-60% better than WebP)
    defaultFormat: 'avif',
    // Quality settings - slightly reduced for better performance
    defaultQuality: 75
  },
  // Redirects for removed obsolete pages
  // Note: Redirect config doesn't work for routes matching dynamic patterns
  // Legacy case study redirects are handled by explicit redirect pages in src/pages/cases/
  redirect: {
    '/about': '/capabilities',
    '/approach': '/cases',
    '/impact': '/lab'
  },
  // 2026: Enable CSP with hash-based approach for static sites
  // TODO: Fix CSP directives format for Astro 6 (pre-existing issue - directives object vs array)
  security: {
    csp: {
      enabled: false
    }
  },
  fonts: [
    {
      provider: fontProviders.fontsource(), // 2026: Prefer Fontsource over Google for privacy
      name: 'Inter',
      cssVariable: '--font-sans',
      weights: ['400', '600', '700']
    },
    {
      provider: fontProviders.fontsource(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      weights: ['400', '500']
    }
  ]
});
