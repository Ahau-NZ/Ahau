import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import legacy from '@vitejs/plugin-legacy'
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import Inspector from 'unplugin-vue-inspector/vite'
import inject from '@rollup/plugin-inject'
import path from 'path'
import fs from 'fs/promises'

const esbuildShim = require.resolve('node-stdlib-browser/helpers/esbuild/shim')

export default defineConfig(async () => {
  const { default: stdLibBrowser } = await import('node-stdlib-browser')

  return {
    // TODO may want to tweak based on cordova...
    base: process.env.NODE_ENV !== 'development' ? './' : '/',
    resolve: {
      alias: {
        ...stdLibBrowser,
        '@': path.resolve(__dirname, './src')
      }
    },
    optimizeDeps: {
      include: ['buffer', 'process']
      // force: true // < for flushing cached node_module state
    },
    plugins: [
      vue(),
      Components({
        resolvers: [
          // Vuetify
          VuetifyResolver()
        ]
      }),

      // follow setup: https://github.com/webfansplz/vite-plugin-vue-inspector
      Inspector({
        vue: 2
        // enabled: true
        // hit "Ctrl + Shift" to enable in browser
      }),
      {
        ...inject({
          global: [esbuildShim, 'global'],
          process: [esbuildShim, 'process'],
          Buffer: [esbuildShim, 'Buffer']
        }),
        enforce: 'post'
      },

      ...mobilePlugins()
    ],
    build: {
      emptyOutDir: true
      // sourcemap: true < for easier production debugging
    }
  }
})

function mobilePlugins () {
  if (process.env.VITE_APP_PLATFORM !== 'cordova') return []

  return [
    {
      name: 'index-html-mobile-replacement',
      transformIndexHtml () {
        return fs.readFile('./index.cordova.html', 'utf8')
      }
    },

    legacy({
      renderModernChunks: false
    })
    // NOTE this plugin enables the export of non-ESM index.legacy.js
    // as cordova (at least version we use) does not support ESM modules
    // https://github.com/vitejs/vite/tree/v4.5.0/packages/plugin-legacy
  ]
}
