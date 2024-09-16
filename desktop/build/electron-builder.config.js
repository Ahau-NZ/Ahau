/* eslint-disable no-template-curly-in-string */
// const fs = require('fs')
// const path = require('path')

module.exports = {
  appId: 'io.ahau.ahau',
  productName: 'Ahau',
  directories: {
    output: 'dist/installers'
  },
  /* ADVANDCED SECTION: */

  /* Only include needed files */
  // we ruthlessly cut all files covered by our main.bundle.js (from esbuild)
  files: [
    // NOTE that we have to include ! (not) rules in files, otherwise
    // electron-builder auto-adds **/*  (add everything!)
    '!build',
    '!node_modules',
    '!*.env*',

    /* main process */
    'main.bundle.js',

    // migrations - needed for ssb-migrate to check all migrations have been provided
    'node_modules/ssb-ahau/src/migrations/',

    // native module bindings for main process
    'node_modules/node-gyp-build/*.js',

    'node_modules/sodium-chloride/*.js',
    'node_modules/sodium-native/index.js',
    'node_modules/sodium-native/prebuilds/${platform}-${arch}/*',

    'node_modules/leveldown/*.js',
    'node_modules/leveldown/prebuilds/${platform}-${arch}/*',

    'node_modules/utp-native/index.js',
    'node_modules/utp-native/prebuilds/${platform}-${arch}/*',

    'node_modules/@atala/prism-wallet-sdk/build/node-wasm/*.wasm',

    /* UI files (referenced by main.bundle.js) */
    'dist',
    '!dist/installers',

    /* ssb-ahoy ui-window dependency */
    'node_modules/ssb-ahoy/electron/preload.js'
  ],
  // NOTE how to figure out what's needed:
  //   1. run `npm run release`
  //   2. try to launch the output (see dist/installers/*.AppImage etc)
  //   3. read the errors about what's missing and add it above
  // asar: false,
  // disable asar bundling to be able to see files easier

  electronLanguages: ['en-GB', 'pt-BR', 'es', 'nl'],
  // drop all the locales not needed to save space
  // To see options: ls installers/linux/unpacked/locales

  /* delete files from the pack! */
  // afterPack (context) {
  //   const ls = fs.readdirSync(context.appOutDir)
  //   console.log(ls)
  // },

  publish: [{
    provider: 'github',
    owner: 'ahau-nz',
    repo: 'ahau',
    releaseType: 'release'
  }],

  ...linux(),
  ...mac(),
  ...windows()
}

function linux () {
  return {
    linux: {
      category: 'Network',
      target: 'AppImage'
    },
    appImage: {
      artifactName: '${name}_Linux-${arch}.${ext}' // eslint-disable-line
    }
  }
}

function mac () {
  return {
    mac: {
      category: 'public.app-category.social-networking',
      icon: 'build/mac/icon.icns',
      hardenedRuntime: true, // N
      gatekeeperAssess: false, // N
      notarize: {
        teamId: process.env.APPLE_TEAM_ID

        // NOTE: the following options MUST be specified via ENV to activate notarization step.
        // It seems electrion-builder doesn't want them entered here as well - they are listed
        // for context + clarity
        // appleId: process.env.APPLE_ID,
        // appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD
      } // N
      // entitlements: 'build/mac/entitlements.mac.plist', // N
      // entitlementsInherit: 'build/mac/entitlements.mac.plist' // N
    },
    dmg: {
      artifactName: '${name}_Mac.${ext}', // eslint-disable-line
      background: 'build/mac/background.png',
      icon: 'build/mac/dmg-icon.icns',
      sign: false // N
    }
    // N = this settings requires for Apple notarization
    // https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/
  }
}

function windows () {
  return {
    win: {
      icon: 'build/win/icon.ico',
      publisherName: [
        'Ahau NZ Ltd', //        name that will probably happen
        'Āhau NZ Ltd', //     << current name
        'Mātou', //              future name
        'Matou' //               future name (without macron, in case)
      ],
      // WARNING - this name must *exactly* match the subject/ "issued to" field on the Signing Certificate
      // otherwise in future if this name changes, auto-updating will fail D:

      // certificateSubjectName: 'Ahau NZ Limited', // The name of the subject of the signing certificate
      // NOTE - this field worked for code signing certificate, but not the EV signing
      certificateSha1: '8BD3CF2F9D2CF6EB7E4EFF9F3890443CF7FC41F8'
      // This is a way to be VERY specific about the exact certificate used. This worked well with EV signing cert.
    },
    nsis: {
      artifactName: '${name}_Windows.${ext}', // eslint-disable-line
      installerIcon: 'build/win/setup-icon.ico',
      include: 'build/win/add-missing-dll.nsh' // fixes missing VCRUNTIME140.dll
      // source: https://github.com/sodium-friends/sodium-native/issues/100
    }
  }
}
