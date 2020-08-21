module.exports = {
  appId: 'io.ahau.ahau',
  productName: 'Ahau',
  afterSign: 'build/mac/notarize.js', // N
  directories: {
    output: 'dist/installers'
  },
  asarUnpack: [
    './node_modules/sodium-native/**' // needed for sodium-native/prebuilds trim, not sure why
  ],

  linux: {
    category: 'Network',
    target: 'AppImage'
  },
  appImage: {
    artifactName: '${name}-Linux-${version}-${arch}.${ext}' // eslint-disable-line
  },

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
  // N = this settings requires for Apple notarization
  // https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/

  win: {
    icon: 'build/win/icon.ico',
    publisherName: ['Āhau Limited', 'Protozoa Limited']
  },
  nsis: {
    artifactName: '${name}-Windows-${version}.${ext}', // eslint-disable-line
    installerIcon: 'build/win/setup-icon.ico'
  },

  files: [
    '**/*',
    /* custom */
    '!dist/installers/*',
    '!electron-builder.env',
    '../ssb-ahau/**/*',

    // sodium-native: only include needed prebuilds
    '!node_modules/sodium-native/prebuilds/*',
    // 'node_modules/sodium-native/prebuilds/${platform}-${arch}/electron.*.node', // eslint-disable-line
    'node_modules/sodium-native/prebuilds/${platform}-${arch}/electron.abi69.node', // eslint-disable-line
    'node_modules/sodium-native/prebuilds/${platform}-${arch}/libsodium.*', // eslint-disable-line

    // README / tests: more aggressive exclusion than default
    '!**/node_modules/**/{CHANGELOG.md,README*,README,readme.md,readme}',
    '!**/node_modules/**/{test,__tests__,tests,powered-test,example,examples}',

    /* custom */

    '!**/node_modules/*.d.ts',
    '!**/node_modules/.bin',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!**/._*',
    '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
    '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
    '!**/{appveyor.yml,.travis.yml,circle.yml}',
    '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}'
  ]
}
