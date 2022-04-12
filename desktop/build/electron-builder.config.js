module.exports = {
  appId: 'io.ahau.ahau',
  productName: 'Ahau',
  directories: {
    output: 'dist/installers'
  },
  files: [
    '!build',
    '!node_modules',
    '!*.env*',

    /* electron main process */
    'main.bundle.js',

    /* migrations - not explicity required */
    // WARNING - currently ssb-ahau/src/migrations are explicitly required
    // we need to fix that to all be included by noderify

    /* native bindings  (dependencies of main.bundle.js) */
    'node_modules/node-gyp-build/index.js',

    'node_modules/sodium-chloride/index.js',

    'node_modules/sodium-native/index.js',
    'node_modules/sodium-native/prebuilds/${platform}-${arch}/*', // eslint-disable-line

    'node_modules/leveldown/index.js',
    'node_modules/leveldown/prebuilds/${platform}-${arch}/*', // eslint-disable-line

    'node_modules/utp-native/index.js',
    'node_modules/utp-native/prebuilds/${platform}-${arch}/*', // eslint-disable-line

    /* UI files (referenced by index.bundle.js) */
    'dist',
    '!dist/installers',

    /* ssb-ahoy ui-window dependency */
    'node_modules/ssb-ahoy/electron/preload.js'
  ],
  // NOTE how to figure out what's needed:
  //   1. run `npm run dist`
  //   2. try to launch the output (see dist/installers/*.AppImage etc)
  //   3. read the errors about what's missing and add it above
  //
  // NOTE that we have to include ! (not) rules in files, otherwise
  // electron-builder auto-adds **/*  (add everything!)

  publish: [{
    provider: 'github',
    owner: 'ahau-nz',
    repo: 'ahau',
    releaseType: 'release'
  }],

  /* Linux */
  linux: {
    category: 'Network',
    target: 'AppImage'
  },
  appImage: {
    artifactName: '${name}-Linux-${version}-${arch}.${ext}' // eslint-disable-line
  },

  /* Mac OS */
  mac: {
    category: 'public.app-category.social-networking',
    icon: 'build/mac/icon.icns',
    hardenedRuntime: true, // N
    gatekeeperAssess: false // N
    // entitlements: 'build/mac/entitlements.mac.plist', // N
    // entitlementsInherit: 'build/mac/entitlements.mac.plist' // N
  },
  dmg: {
    artifactName: '${name}-Mac-${version}.${ext}', // eslint-disable-line
    background: 'build/mac/background.png',
    icon: 'build/mac/dmg-icon.icns',
    sign: false // N
  },
  afterSign: 'build/mac/notarize.js', // N
  // N = this settings requires for Apple notarization
  // https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/

  /* Windows */
  win: {
    icon: 'build/win/icon.ico',
    publisherName: [
      'Āhau NZ Limited', // << New name
      'Ahau NZ Limited' // << old certificate name, to be deprecated
    ],
    // WARNING - this name must *exactly* match the subject/ "issued to" field on the Signing Certificate
    // otherwise in future if this name changes, auto-updating will fail D:

    // certificateSubjectName: 'Ahau NZ Limited', // The name of the subject of the signing certificate
    // NOTE - this field worked for code signing certificate, but not the EV signing
    certificateSha1: 'A5F49ED3D5EBBCA6EE093BF2A8AA93DA36BDBF56'
    // This is a way to be VERY specific about the exact certificate used. This worked well with EV signing cert.
  },
  nsis: {
    artifactName: '${name}-Windows-${version}.${ext}', // eslint-disable-line
    installerIcon: 'build/win/setup-icon.ico',
    include: 'build/win/add-missing-dll.nsh' // fixes missing VCRUNTIME140.dll
    // source: https://github.com/sodium-friends/sodium-native/issues/100
  }
}
