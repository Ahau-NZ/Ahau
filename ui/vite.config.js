import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import path from 'path'
import inject from '@rollup/plugin-inject'

const esbuildShim = require.resolve('node-stdlib-browser/helpers/esbuild/shim')

export default defineConfig(async () => {
  const { default: stdLibBrowser } = await import('node-stdlib-browser')
  // NOTE must by dynamically imported

  return {
    base: process.env.IS_DEV !== 'true' ? './' : '/',
    resolve: {
      alias: {
        ...stdLibBrowser,
        '@': path.resolve(__dirname, './src')
      }
    },
    optimizeDeps: {
      include: ['buffer', 'process'],
      force: true
    },
    plugins: [
      vue(),
      Components({
        resolvers: [
          // Vuetify
          VuetifyResolver()
        ]
      }),
      {
        ...inject({
          global: [esbuildShim, 'global'],
          process: [esbuildShim, 'process'],
          Buffer: [esbuildShim, 'Buffer']
        }),
        enforce: 'post'
      }
    ],
    css: {
      preprocessorOptions: {
        scss: {
          // to stop all the sass warning about / being a deprecated operator
          quietDeps: true
        }
      }
    }
  }
})
