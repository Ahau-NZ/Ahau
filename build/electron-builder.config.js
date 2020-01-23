module.exports = {
  appId: 'io.ahau.ahau',
  productName: 'Ahau',
  afterSign: 'build/mac/notarize.js', // N
  directories: {
    'output': 'dist/installers'
  },

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
    background: 'build/mac/background.png',
    hardenedRuntime: true, // N
    gatekeeperAssess: false // N
    // entitlements: 'build/mac/entitlements.mac.plist', // N
    // entitlementsInherit: 'build/mac/entitlements.mac.plist' // N
  },
  dmg: {
    artifactName: '${name}-Mac-${version}.${ext}', // eslint-disable-line
    icon: 'build/mac/dmg-icon.icns',
    sign: false // N
  },
  // N = this settings requires for Apple notarization
  // https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/

  win: {
    icon: 'build/win/icon.ico',
    publisherName: [
      'Āhau Limited',
      'Protozoa Limited'
    ]
  },
  nsis: {
    artifactName: '${name}-Windows-${version}.${ext}', // eslint-disable-line
    installerIcon: 'build/win/setup-icon.ico'
  },

  files: [
    '**/*',

    /* custom */
    '!src/*',
    '!public/*',
    '!dist/installers/*',
    '!electron-builder.env',
    '!**/node_modules/**/{CHANGELOG.md,README*,README,readme.md,readme}',
    '!**/node_modules/**/{test,__tests__,tests,powered-test,example,examples}',
    /* custom */

    '!**/node_modules/*.d.ts',
    '!**/node_modules/.bin',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!.editorconfig',
    '!**/._*',
    '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
    '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
    '!**/{appveyor.yml,.travis.yml,circle.yml}',
    '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}'
  ]
}
