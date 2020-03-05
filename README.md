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
// Installs dependencies and creates Cordova folders for the Android project
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
```

Compiles and minifies code (and assets) for production, outputs to `./desktop/dist`.
You can try running the build with `npm run start:desktop`.


## Publishing installers

### Desktop

```bash
$ npm run release:desktop
```

Compiles and minifies code (and assets) for production, builds installer (using compiled clientside code + back end code), and outputs to `./release/desktop`.

NOTES
- See : https://www.electron.build/code-signing for useful links
- **Mac needs**
  - Application Installer + Apllication certificates set up in your apple keychain for signing
  - an `desktop/electron-builder.env` with environment variables `APPLE_ID`, `APPLE_ID_PASS` for notarization, e.g :
     ```
     APPLE_ID=name@company.com
     APPLE_ID_PASS=asdl-tyan-osla-ttyb
     ```
    - `APPLE_ID_PASS` is an application specific password created from your `APPLE_ID`

- **Windows needs**
  - `build/win_csc.pfx` file
  - an `desktop/electron-builder.env` with environment variable `CSC_LINK` and `CSC_KEY_PASSWORD` (the password to the .pfx cert)
    ```
    CSC_LINK=build/win/csc.pfx
    CSC_KEY_PASSWORD=anliushfdxbaejhbrsajxhelaser
    ```

  - Mix bought the Signing Cerificate [here](https://docs.microsoft.com/en-us/windows-hardware/drivers/dashboard/get-a-code-signing-certificate?redirectedfrom=MSDN)
    - notes on aquiring + exporting :
      - https://support.sectigo.com/Com_KnowledgeDetailPage?Id=kA01N000000zFK0#ie_export_certificate
      - this may need to be done from the same browser as you applied for the certificate from

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

## Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### see also:

```
npm run dev:web // starts the mobile server and a ui live-reload server

npm run test:ui // test

npm run lint // lint whole project

npm run lint:ui // lint only UI

npm run cleanup // delete node_modules and package-lock.json files from all packages
```
