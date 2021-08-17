# Ahau Mobile

## Setup

- **IMPORTANT** Make sure you have all the necessary tools such as Git, Node.js, npm, Android SDK, Android NDK etc.
- [Follow the Cordova guide](https://cordova.apache.org/docs/en/9.x/guide/cli/index.html#installing-the-cordova-cli)
- [Follow the Cordova Android platform guide](https://cordova.apache.org/docs/en/9.x/guide/platforms/android/index.html#requirements-and-support)
- [Follow the nodejs-mobile-cordova guide](https://github.com/JaneaSystems/nodejs-mobile-cordova)
- [Apply this Android NDK hack for "mipsel-linux-android"](https://github.com/JaneaSystems/nodejs-mobile-cordova#android)


**IMPORTANT**
Use Node.js 12.19 AND npm 6, later version of npm aren't compiling the native modules.


```bash
$ npm install
$ npm run setup:mobile
// Installs dependencies and creates Cordova folders for the Android and iOS platforms
```

## Development

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
$ npm run dev:android-prod
// compiles everything and runs the Android app on a device (running in dev mode) with the Ahau environment of production (that can connect to Pataka in production)
```

```bash
$ npm run dev:android-update
// compiles just the frontend and runs the Android app on a device
```


## Publishing installers

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
$ npm run release:android   # from root folder
// builds an apk to android
```

```bash
$ npm run release:android-dev   # from root folder
// builds an apk to android that connects with Pataka in development
```

After it is done, you can find the APK file at

```
./releases/android/app-release.apk
```

Take that file and upload it in the Google Play developer console website.

