module.exports = {
  appId: 'org.ahau.whakapapa-ora',
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
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist'
  },
  dmg: {
    artifactName: '${name}-Mac-${version}.${ext}', // eslint-disable-line
    icon: 'build/dmg-icon.icns',
    sign: false
  },
  win: {
    publisherName: 'Ahau'
  },
  nsis: {
    artifactName: '${name}-Windows-${version}.${ext}', // eslint-disable-line
    installerIcon: 'build/setup-icon.ico'
  },
  files: [
    '**/*',
    '!src/*',
    '!public/*',
    '!dist/installers',
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
}
