import * as esbuild from 'esbuild'
import dirnameFix from 'esbuild-plugin-fileloc'
import fs from 'node:fs'

const result = await esbuild.build({
  entryPoints: ['main.js'],
  bundle: true,
  platform: 'node',
  target: 'node18.6.1',
  external: [
    'electron' // shouldn't bundle
  ],
  plugins: [
    dirnameFix.filelocPlugin()
    // fixes __dirname refs used by node-gyp-build
    // see also: https://github.com/evanw/esbuild/issues/859

    // NOTE this plugin has been patched (see /patches/esbuild-plugin-fileloc.diff)
    // It was installing absolute paths (encoding the directories of the building computer!)
  ],
  outfile: 'main.bundle.js',
  metafile: true
})

fs.writeFileSync('meta.json', JSON.stringify(result.metafile))
// check it out: https://esbuild.github.io/analyze/
