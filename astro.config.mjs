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
    // Default format for optimized images
    defaultFormat: 'webp',
    // Quality settings
    defaultQuality: 80
  },
  // Redirects for removed obsolete pages
  redirect: {
    '/about': '/capabilities',
    '/approach': '/cases',
    '/impact': '/lab'
  },
    // security: {
  //   csp: true
  // },
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
