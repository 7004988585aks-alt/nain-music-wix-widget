import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

function inlineWidgetCss(): Plugin {
  return {
    name: 'nain-music-inline-widget-css',
    apply: 'build',
    generateBundle(_options, bundle) {
      const cssAsset = Object.entries(bundle).find(([, item]) => item.type === 'asset' && item.fileName.endsWith('.css'));
      if (!cssAsset) {
        throw new Error('Widget build expected a generated CSS asset, but none was found.');
      }

      const [cssFileName, cssAssetItem] = cssAsset;
      const cssSource = typeof cssAssetItem.source === 'string'
        ? cssAssetItem.source
        : Buffer.from(cssAssetItem.source).toString('utf8');

      const jsEntries = Object.values(bundle).filter(
        (item): item is Extract<typeof item, {type: 'chunk'}> => item.type === 'chunk' && item.isEntry,
      );

      if (jsEntries.length !== 1) {
        throw new Error(`Widget build expected exactly one JS entry chunk; found ${jsEntries.length}.`);
      }

      const entry = jsEntries[0];
      const cssLiteral = JSON.stringify(cssSource);
      const runtime = `\n(function(){\n  var s=document.querySelector('style[data-nain-music-widget-runtime]');\n  if(!s){s=document.createElement('style');s.setAttribute('data-nain-music-widget-runtime','true');s.textContent=${cssLiteral};document.head.appendChild(s);}\n})();\n`;

      entry.code = entry.code.replace('__NAIN_WIDGET_CSS__', '');
      entry.code = runtime + entry.code;
      delete bundle[cssFileName];
    },
  };
}

export default defineConfig(({command, mode}) => {
  const isWidgetBuild = command === 'build' && mode === 'widget';

  return {
    plugins: [react(), tailwindcss(), ...(isWidgetBuild ? [inlineWidgetCss()] : [])],
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
