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
  files: [
    '**/*',

    /* custom */
    '!build/node_modules',
    '!dist/installers',
    '!electron-builder.env',

    // sodium-native: only include needed prebuilds
    '!node_modules/sodium-native/{src,test,libsodium,tmp}',
    '!node_modules/sodium-native/prebuilds/*',
    'node_modules/sodium-native/prebuilds/${platform}-${arch}/*', // eslint-disable-line

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
  ],
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
  // N = this settings requires for Apple notarization
  // https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/

  /* Windows */
  win: {
    icon: 'build/win/icon.ico',
    publisherName: ['Ahau NZ Limited']
    // WARNING - this name must exactly match the subject/ "issued to" field on the Signing Certificate
    // In future if this name changes, auto-updating will fail D:
  },
  nsis: {
    artifactName: '${name}-Windows-${version}.${ext}', // eslint-disable-line
    installerIcon: 'build/win/setup-icon.ico',
    include: 'build/win/add-missing-dll.nsh' // fixes missing VCRUNTIME140.dll
    // source: https://github.com/sodium-friends/sodium-native/issues/100
  }
}
