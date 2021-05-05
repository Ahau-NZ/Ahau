# Āhau

A whakapapa app that works peer-to-peer, and doesn't require internet.
All data is held by you and those friends you connect with, and is cryptographically secured.

Built on [scuttlebutt](www.scuttlebutt.nz)

For more info see ahau.io

## Setup

```bash
$ npm install
```

### Desktop

```bash
$ npm run setup:desktop
// Npm installs the desktop project
```

### Mobile

- **IMPORTANT** Make sure you have all the necessary tools such as Git, Node.js, npm, Android SDK, Android NDK etc.
- [Follow the Cordova guide](https://cordova.apache.org/docs/en/9.x/guide/cli/index.html#installing-the-cordova-cli)
- [Follow the Cordova Android platform guide](https://cordova.apache.org/docs/en/9.x/guide/platforms/android/index.html#requirements-and-support)
- [Follow the nodejs-mobile-cordova guide](https://github.com/JaneaSystems/nodejs-mobile-cordova)
- [Apply this Android NDK hack for "mipsel-linux-android"](https://github.com/JaneaSystems/nodejs-mobile-cordova#android)


```bash
$ npm run setup:mobile
// Installs dependencies and creates Cordova folders for the Android and iOS platforms
```

### Pātaka

```bash
$ npm run setup:pataka
// Npm installs the pātaka project
```


## Development

### Desktop

```bash
$ npm run dev:desktop
// launches the scuttlebutt + graphql servers + electron
// and starts a webpack dev-server which serves up live-updating UI
```

NOTES
- live-reload doesn't work for `ssb-server` (back end) code.
- Windows sets env differently. Open 2 Powershell windows and run the following in each:
  - `npm run dev:ui`
  - `cd desktop`, then `npm run start:dev` (this sets the env to development and launches electron app)


### Mobile

- Make sure you have a **real Android device**, not an emulator
- Put your Android device in Developer Mode
  - Open the Android settings, scroll down to "About phone"
  - Scroll down to "Build number", and **tap it 7 times**
- Plug your Android device to your computer via USB
- On the Android device, **allow** your computer access to the device

```bash
$ npm run dev:android
// compiles everything and runs the Android app on a device
```

```bash
$ npm run dev:android-update
// compiles just the frontend and runs the Android app on a device
```

### Pātaka

```bash
$ npm run dev:pataka
// launches the scuttlebutt + graphql servers + electron
// and starts a webpack dev-server which serves up live-updating UI
```
NOTES: same as desktop

### Other tools

- [Graphiql](https://github.com/graphql/graphiql)
  - a sweet GraphQL tool for exploring generated doc and practicing queries/ mutations with the server
  - start the above dev environment then go to http://localhost:4000/graphql
- [Storybook](https://storybook.js.org/)
  - a tool to help you build components in isolation
  - start it with `npm run storybook`
  - serves up `*.stories.js` files

## Production Build

```bash
$ npm run build-ui:desktop
$ npm run build-ui:pataka
```

Compiles and minifies code (and assets) for production, outputs to `./desktop/dist` and `./pataka/dist`.
You can try running the build with `npm run start:desktop` or `npm run start:pataka`.


## Publishing installers

### Desktop

Think about what the new version is going to be
- update `package.json` version (e.g `1.12.3`)
- update `desktop/package.json` to match that
- run the following

```bash
$ npm i && cd desktop && npm i && cd ..
$ git add .
$ git commit -m "v1.12.3"   # same as your package.json version but with a v in front
$ git tag v1.12.3
$ git push origin master --tags
$ git push github master --tags   # the protozoa-nz/whakapapa-ora repo
$ npm run release:desktop
```

(you can use `npm version` if you know how to use it and keep all the `package.json` versions lined up)

Compiles and minifies code (and assets) for production, builds installer (using compiled clientside code + back end code), and outputs to `./release/desktop`.

NOTES
- See : https://www.electron.build/code-signing for useful links
- **All platforms need**
    - an `desktop/electron-builder.env` with environment variable `GH_TOKEN`
    - each developer with publishing rights to `github.com/protozoa-nz/whakapapa-ora` needs to make their own token, make one [here](https://github.com/settings/tokens/new), selecting "repo" permissions
- **Mac needs**
    - Application Installer + Apllication certificates set up in your apple keychain for signing
        - go to developer.apple.com , go into "account", sign in, look at "certificates"
        - you need to buy / mint an "Developer ID Application" and "Developer ID Installer" certificate
          - you might need to jump through CSR (code signing request) hoops at this point
        - you might get some `altool` error ... duckduckgo this, it's some Xcode error
    - an `desktop/electron-builder.env` with environment variables `APPLE_ID`, `APPLE_ID_PASS` for notarization, e.g :
         ```
         APPLE_ID=name@company.com
         APPLE_ID_PASS=asdl-tyan-osla-ttyb
         ```
        - `APPLE_ID_PASS` is an application specific password created from your `APPLE_ID`

- **Windows needs**
    - `desktop/build/win/win_csc.pfx` file
    - an `desktop/electron-builder.env` with environment variable `CSC_LINK` and `CSC_KEY_PASSWORD` (the password to the .pfx cert)
        ```
        CSC_LINK=build/win/csc.pfx
        CSC_KEY_PASSWORD=anliushfdxbaejhbrsajxhelaser
        ```

    - Mix bought the Signing Cerificate [here](https://docs.microsoft.com/en-us/windows-hardware/drivers/dashboard/get-a-code-signing-certificate?redirectedfrom=MSDN)
        - notes on aquiring + exporting :
            - https://support.sectigo.com/Com_KnowledgeDetailPage?Id=kA01N000000zFK0#ie_export_certificate
            - this may need to be done from the same browser as you applied for the certificate from
    - .exe file will be in releases/desktop

### Mobile (Android)

First, ask the project manager for these secrets:

- The "keystore file" (`ahau-android-upload-key.keystore`)
- The "build.json file" (contains the 40 character password)

Put both files in:

- `mobile/ahau-android-upload-key.keystore`
- `mobile/build.json`

**Warning! Never git commit** neither of those files! They are secret to team members only. Make sure the file `mobile/build.json` looks like this:

```json
{
  "android": {
    "release": {
      "keystore": "ahau-android-upload-key.keystore",
      "keystoreType": "pkcs12",
      "alias": "ahau-whakapapa-app",
      "storePassword": "THE 40 CHARACTERS LONG PASSWORD IS HERE",
      "password" : "THE 40 CHARACTERS LONG PASSWORD IS HERE"
    }
  }
}
```

When all of that is set up, just run

```bash
$ npm run release:android
```

After it is done, you can find the APK file at

```
./releases/android/app-release.apk
```

Take that file and upload it in the Google Play developer console website.

### Pataka

```bash
$ npm run release:pataka
```

Compiles and minifies code (and assets) for production, builds installer (using compiled clientside code + back end code), and outputs to `./release/pataka`.

Notes: same as desktop


## Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### see also:

```
npm run dev:web // starts the mobile server and a ui live-reload server

npm run test:ui // test

npm run lint // lint whole project

npm run lint:ui // lint only UI

npm run lint:pataka // lint only pataka UI

npm run clear:all // deletes node_modules from the ./, desktop and ui folders

npm run clear:desktop // deletes node_modules from /desktop

npm run clear:ui // deletes node_modules from /ui

npm run clear // deletes node_modules from ./

npm run install:all // installs dependencies in the ./, desktop and ui folders

npm run install:desktop // installs dependencies in desktop

npm run install:ui // installs dependencies in ui
```

## Troubleshooting

If `vue-cli-service` is not detected or recognised as a command, in the root folder run

```bash
$ npm cache clean -f
```

Following this, reinstall the required dependencies with

```bash
$ npm install
```

