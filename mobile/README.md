# Ahau Mobile

## Setup

**IMPORTANT**

Must use Node 12.19.0 and NPM 6 (because this is what `nodejs-mobile-cordova` embeds)
Use [NVM](https://github.com/nvm-sh/nvm) and run:
```bash
nvm install 12.19.0
nvm use 12.19.0
```

### Source docs

To build the mobile app you need to follow the following
- [Cordova guide](https://cordova.apache.org/docs/en/10.x/guide/overview/index.html)
- [Cordova Android platform guide](https://cordova.apache.org/docs/en/10.x/guide/platforms/android/index.html#installing-the-requirements)
- [nodejs-mobile-cordova guide](https://github.com/JaneaSystems/nodejs-mobile-cordova)

No longer needed (?)
- [Android NDK hack for "mipsel-linux-android"](https://github.com/JaneaSystems/nodejs-mobile-cordova#android)


### Mix's Linux Setup

This guide was written by folliwing the "Source docs", with a lot of trial-and-error
to pin down the exact versions of tools needed to all work together.

1. Install Cordova 10 (OLD)
    - references:
      - https://cordova.apache.org/docs/en/10.x/
      - https://cordova.apache.org/docs/en/10.x/guide/platforms/android/index.html
    - `npm install -g cordova@10`
2. Install Cordova deps for Android
    - SDKMAN (tool used to manage sdk installs, versions)
      - `curl -s "https://get.sdkman.io" | bash`
    - JDK 11
      - `sdk install java 8.0.372-tem`
      - `java -version` should be 8
    - Gradle
      - `sdk install gradle 8.1`
    - Android Studio: https://developer.android.com/studio/
      - https://developer.android.com/studio/install#linux
        ```bash
        sudo apt-get install libc6:i386 libncurses5:i386 libstdc++6:i386 lib32z1 libbz2-1.0:i386
        tar -xvz -f android-studio-2022.2.1.18-linux.tar.gz
        sudo mv android-studio /opt/
        cd /usr/bin && sudo ln -s /opt/android-studio/bin/studio.sh studio
        ```
      - start android studio from terminal `studio`, and follow the default path for setup
        - went "More actions > SDK Manager" and added
          - SDK Platforms tab
             - [x] Android 10.0 (Q)
          - SDK Tools tab:
             - [x] Android SDK Build-Tools > 30.0.3
                - check "show package details"
             - [x] Android NDK (side by side) > 22.1.7161670
                - note this is the last version which has the `make-standalone-toolchain.sh` we need
             - [x] Android SDK Command-line Tools (latest)
             - [x] CMake > 3.10.2.4988404
                - check "show package details"
             - [x] Android SDK Tools (obselete)
                - uncheck "hide obselete packages"
      - added vars to my `.zshrc` (or `.bash_profile` `.bashrc`)
        ```
        export ANDROID_HOME=$HOME/Android/Sdk
        export ANDROID_NDK_HOME=$ANDROID_HOME/ndk

        export PATH=$PATH:$ANDROID_HOME/platform-tools
        export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
        export PATH=$PATH:$ANDROID_HOME/emulator
        export PATH=$PATH:$ANDROID_HOME/build-tools

        export ANDROID_SDK_ROOT=$ANDROID_HOME # legacy?
        ```
      - Project Configuration
        - setting up an emulator: SKIP
        - configuring gradle: SKIP
          - https://cordova.apache.org/docs/en/10.x/guide/platforms/android/index.html#configuring-gradle

3. Install [node-gyp](https://github.com/nodejs/node-gyp) dependencies
    ```bash
    sudo apt-get install make gcc python2 libtool
    ```
    - may need to set up "python" to point at correct version of python
        ```bash
        cd /usr/bin
        sudo ln -s python2 python
        ```

4. set the mobile part of the repo up
    ```bash
    cd mobile
    npm install && npm run setup
    ```

5. from root of project run `npm run dev:android`

NOTES:
- moved iOS deps/config into package.json `"paused"`
    - preserving the object structure to make it clear how to merge those back in later
- Gradle intro : https://developer.android.com/build

- our new Vite setup generate ESM JS by default
    - Cordova may not accept / support this?
        - fix? use `@vitejs/plugin-legacy` to support no-module
- debugging in production
    - change the `--release` flag to `--debug` in `scripts/run.sh`
    - connect the phone by USB
    - enable USB debugging
    - open the app
    - open `chrome://inspect#devices` in Chrome / Chromium


```bash
$ npm install
$ npm run setup
// Installs dependencies and creates Cordova folders for the Android and iOS platforms
// You should see happy green messages printed out
// NOTE sometimes it exits with an error. If you run ./script/setup.sh you shouldn't see an error
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

```bash
./releases/android/app-release.apk
```

Take that file and upload it in the Google Play developer console website.
Or try it locally with an attached phone

```bash
adb devices
adb install ./releases/android/app-release.apk
```

You can log out activity from an attached phone like this:

```bash
adb logcat -e nodejs
```

This logs a lot but you may need to log everything from the pid that Ahau is running, e.g. if it is running on pid 12334:

```bash
adb logcat | grep 12334
```

