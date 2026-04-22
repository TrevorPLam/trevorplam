import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  // Global ignores
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.astro/',
      'tests/reports/',
      '**/*.d.ts'
    ]
  },
  
  // Astro files
  ...eslintPluginAstro.configs.recommended
];
