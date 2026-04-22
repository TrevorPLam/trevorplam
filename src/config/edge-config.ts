// 2026: Edge computing configuration
export const edgeConfig = {
  // Edge regions for global performance
  regions: ['iad1', 'sin1', 'fra1'], // Edge regions
  cacheStrategy: {
    static: '1y', // Static assets cached for 1 year
    api: '300s', // API responses cached for 5 minutes
    html: '60s' // HTML cached for 1 minute
  },
  compression: {
    brotli: true,
    gzip: true
  },
  // Resource prioritization hints
  priorityHints: [
    { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
    { href: '/critical.css', as: 'style' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://api.example.com' }
  ]
};

export type EdgeConfig = typeof edgeConfig;
