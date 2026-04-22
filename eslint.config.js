import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  // Global ignores
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.astro/',
      '*.config.js',
      '*.config.mjs',
      'lighthouserc.js',
      '.eslintrc.security.js'
    ]
  },
  
  // Astro files
  ...eslintPluginAstro.configs.recommended
];
