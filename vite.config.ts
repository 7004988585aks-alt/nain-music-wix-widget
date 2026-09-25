import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({command, mode}) => {
  const isWidgetBuild = command === 'build' && mode === 'widget';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: isWidgetBuild
      ? {
          outDir: 'dist-widget',
          emptyOutDir: true,
          cssCodeSplit: false,
          assetsInlineLimit: Number.MAX_SAFE_INTEGER,
          rollupOptions: {
            input: path.resolve(__dirname, 'src/custom-element.tsx'),
            output: {
              format: 'iife',
              entryFileNames: 'nain-music-widget.js',
              assetFileNames: 'nain-music-widget-[name][extname]',
              inlineDynamicImports: true,
            },
          },
        }
      : undefined,
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
