# Ahau Mobile

## Setup

- **IMPORTANT** Make sure you have all the necessary tools such as Git, Node.js, npm, Android SDK, Android NDK etc.
- [Follow the Cordova guide](https://cordova.apache.org/docs/en/9.x/guide/cli/index.html#installing-the-cordova-cli)
- [Follow the Cordova Android platform guide](https://cordova.apache.org/docs/en/9.x/guide/platforms/android/index.html#requirements-and-support)
- [Follow the nodejs-mobile-cordova guide](https://github.com/JaneaSystems/nodejs-mobile-cordova)
- [Apply this Android NDK hack for "mipsel-linux-android"](https://github.com/JaneaSystems/nodejs-mobile-cordova#android)


**IMPORTANT**

Use Node.js 18 AND npm 9

// NEW NOTES

1. Install Cordova 11 (latest)
    - references:
      - https://cordova.apache.org/docs/en/latest/guide/cli/index.html
      - https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#requirements-and-support
    - `npm install -g cordova`
2. Install Cordova deps for Android
    - SDKMAN (tool used to manage sdk installs, versions)
      - `curl -s "https://get.sdkman.io" | bash`
    - JDK 11
      - `sdk install java 11.0.18-tem`
      - `java --version` should be 11
    - Gradle
      - `sdk install gradle 8.1`
    - Android Studio: https://developer.android.com/studio/
      - https://developer.android.com/studio/install#linux
        ```
        sudo apt-get install libc6:i386 libncurses5:i386 libstdc++6:i386 lib32z1 libbz2-1.0:i386
        tar -xvz -f android-studio-2022.2.1.18-linux.tar.gz
        sudo mv android-studio /opt/
        cd /usr/bin && sudo ln -s /opt/android-studio/bin/studio.sh studio
        ```
      - start android studio from terminal `studio`, and follow the default path for setup
        - went "More actions > SDK Manager" and added
          - SDK Platforms tab
             - [x] Android 12.0 (S)
             - [x] Android 10.0 (Q)
          - SDK Tools tab:
             - [x] Android SDK Build-Tools > 32.0.0
             - [x] Android SDK Build-Tools > 31.0.0
                - had to check "show package details"
             - [x] Android NDK (side by side)
             - [x] Android SDK Command-line Tools (latest)
             - [x] CMake
             - [x] Android SDK Tools (obselete)
                - had to uncheck "hide obselete packages"
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


      - TODO: To make Android Studio available in your list of applications, select Tools > Create Desktop Entry from the Android Studio menu bar.



EXTRA NOTES:
- node-gyp 3.8 has various dependencies:
  ```
  sudo apt-get install make gcc python2
  ```
- went back and added NDK stuff
-

---

Use Node.js 12 AND npm 6

// NEW NOTES

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
        ```
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
             - [x] Android SDK Build-Tools > 29.0.3
                - had to check "show package details"
             - [x] Android NDK (side by side) > 22.1.7...
                - note this is the last version which has the `make-standalone-toolchain.sh` we need
             - [x] Android SDK Command-line Tools (latest)
             - [x] CMake
             - [x] Android SDK Tools (obselete)
                - had to uncheck "hide obselete packages"
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
          - SHOULD COME BACK TO THIS!!!
          - https://cordova.apache.org/docs/en/10.x/guide/platforms/android/index.html#configuring-gradle


3. run `npm i && npm run setup`
4. run `npm run dev:android`
    - see some error:
      ```
      > Task :app:MakeToolchainarmeabi-v7a FAILED

      FAILURE: Build failed with an exception.

      * What went wrong:
      Execution failed for task ':app:MakeToolchainarmeabi-v7a'.
      > A problem occurred starting process 'command '/home/username/Android/Sdk/ndk/25.2.9519653/build/tools/make-standalone-toolchain.sh''
      ```
    - note `make-standalone-toolchain.sh` does not exist, is instead `make_standalone_toolchain.py`
      - see generated file `platforms/mobile/android/nodejs-mobile-cordova/whakapapa-build.gradle:221`
      - note investigated AndroidStudio / Gradle / NDK versions... this suggests ndk 25 should be fine?
        - rolling back to 23 and we find the shell script!
        - then to 22 to get `prebuilt-common.sh`
        - make sure `which python` answers with something
          - `cd /usr/bin && sudo ln -s python2 python`
          - `sudo apt-get install libtool`


    - WIP notes:
      - updates ssb-crut
      - in src/nodejs-project patched ssb-crut to not require ssb-db2
      - progressing npm run dev:android (feeling close!)


TODO:
- To make Android Studio available in your list of applications, select Tools > Create Desktop Entry from the Android Studio menu bar.

NOTES:
- moved iOS deps/config into package.json `"paused"`
    - preserving the object structure to make it clear how to merge those back in later
- Gradle intro : https://developer.android.com/build


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

```
./releases/android/app-release.apk
```

Take that file and upload it in the Google Play developer console website.

