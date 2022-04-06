module.exports = {
  appId: 'io.ahau.ahau',
  productName: 'Ahau',
  afterSign: 'build/mac/notarize.js', // N
  directories: {
    output: 'dist/installers'
  },
  files: fileRules([
    /* local setup */
    '!build/node_modules',
    '!dist/installers',
    '!electron-builder.env',

    // sodium-native - drop un-needed prebuilds
    '!node_modules/sodium-native/{prebuilds/*, deps, test, binding.*, *.md}',
    'node_modules/sodium-native/prebuilds/${platform}-${arch}/*', // eslint-disable-line

    // leveldown - drop un-needed prebuilds
    '!node_modules/leveldown/{prebuilds/*, deps, binding.*, *.md}',
    'node_modules/leveldown/prebuilds/${platform}-${arch}/*', // eslint-disable-line

    // es-abstract
    '!node_modules/es-abstract/',
    'node_modules/es-abstract/helpers/getOwnPropertyDescriptor.js'
  ]),
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

function fileRules (rules) {
  // defaults from electron-builder
  //   https://www.electron.build/configuration/contents#files
  const defaults = [
    '**/*',
    '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
    '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
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

  return [...defaults, ...rules]
}
