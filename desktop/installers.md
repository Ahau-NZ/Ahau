# Publishing Installers

## Requirements

- a `desktop/electron-builder.env` file with environment variable `GH_TOKEN`
- each developer with publishing rights to `github.com/ahau-nz/ahau` needs to make their own token, make one [here](https://github.com/settings/tokens/new), selecting "repo" permissions
- a `ui/.env` with environment variable `MIXPANEL_TOKEN`

## Platforms

### MacOS

#### Requirements

- Needs the [Requirements](/desktop/installers.md#requirements) listed at the top of this page
- Application Installer + Apllication certificates set up in your apple keychain for signing
  1. go to [developer.apple.com](https://developer.apple.com)
  2. go into **Account** and Sign in
  3. go to **Certificates**
  4. click the **(+)** to create a new certificate
  5. create two new certificate, one for **Developer ID Application** and one for **Developer ID Installer**
      > NOTE: you might need to jump through CSR (code signing request) hoops at this point
  6. Download the certificates and click on them to install them in your keychain
- a `desktop/electron-builder.env` file with environment variables `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD` for notarization, e.g:

    ```
    APPLE_ID=name@company.com
    APPLE_APP_SPECIFIC_PASSWORD=asdl-tyan-osla-ttyb
    APPLE_TEAM_ID=Z4E9R3WFQQ
    ```
    - `APPLE_APP_SPECIFIC_PASSWORD` is an application specific password created from your `APPLE_ID` see [here](https://support.apple.com/en-nz/HT204397#:~:text=How%20to%20generate%20an%20app%2Dspecific%20password)
    - `APPLE_TEAM_ID` is the team ID you want to notarize under, you can find this by logging into your [Apple Developer Account](https://developer.apple.com/account/) and it should  be listed
  

- If you're using `macOS >=12.3`, you need to have python2 installed and provide a path. This is because after `macOS 12.3`, python 2.7 is not installed by default.
  1. Check if you have python2 installed and print the path
      ```
      which python2
      # e.g. /usr/local/bin/python2
      ```
    - Download this [macOS 64-bit installer](https://www.python.org/ftp/python/2.7.18/python-2.7.18-macosx10.9.pkg)  if you dont have python2 installed and run step **1** again to get the path
  2. When running the release below you'll need to specify the python path like:
      ```
      PYTHON_PATH=/usr/local/bin/python2 npm run release:desktop
      ```

#### Other known issues:
- you might get some `altool` error ... duckduckgo this, it's some Xcode error
- If you get an error: `Module dmg-license not found`, you can install it by running the following from the `desktop/` folder in this repo:
  ```
  npm i dmg-license
  ```
- The build may fail because you need to accept new terms and conditions on [developer.apple.com](https://developer.apple.com)

### Windows

#### Requirements

- Needs the [Requirements](/desktop/installers.md#requirements) listed at the top of this page
- currently we're using an EV signing certificate (this is in the form of a USB key)
- install software for the USB key signing
    1. followed [this](https://sectigo.com/knowledge-base/detail/SafeNet-Download-for-Certificates-using-an-eToken-Smartcard/kA03l000000o6kL) guide
    2. downloaded [this](https://comodoca.my.salesforce.com/sfc/dist/version/download/?oid=00D1N000002Ljih&ids=0683l00000PzlJ9&d=%2Fa%2F3l000000dZF7%2FNq45bYpIQUcGqviLxxUDq.KusYS5Enj8K_BDIISyGyc&asPdf=false)
        - install, restart, start app (starts in system tray)

    3. set `win.certificatesha1` field in `build/electron-builder.config.js`
        - not sure how to derive this from USB key, but when I put something wrong it gave me a list of possible certificates it it was checking through, and each had a `"Thumbprint"` field, which seems to be the sha1 hash...
    4. you should now be prompted to enter a password when signing
        - to prevent being asked for every file that's signed, check "enable single login" in SafeNet
        - followed [this](https://stackoverflow.com/questions/17927895/automate-extended-validation-ev-code-signing) guide


#### Notes for former process for windows
- ensure `desktop/build/win/win_csc.pfx` file is in place
- add an `desktop/electron-builder.env` with environment variables `CSC_LINK` and `CSC_KEY_PASSWORD` (the password to the .pfx cert)
    ```
    CSC_LINK=build/win/csc.pfx
    CSC_KEY_PASSWORD=anliushfdxbaejhbrsajxhelaser
    ```
- Mix bought the Signing Cerificate [here](https://docs.microsoft.com/en-us/windows-hardware/drivers/dashboard/get-a-code-signing-certificate?redirectedfrom=MSDN)
    - notes on aquiring + exporting :
        - https://support.sectigo.com/Com_KnowledgeDetailPage?Id=kA01N000000zFK0#ie_export_certificate
        - this may need to be done from the same browser as you applied for the certificate from

### Linux

#### Requirements

_Nothing_

---

## Building a release

1. Add the [github/Ahau](https://github.com/Ahau-NZ/Ahau.git) repo as a new remote
    ```
    git add remote ahau https://github.com/Ahau-NZ/Ahau.git
    ```
2. Update the `package.json` versions

    Think about what the new version is going to be
    - update `package.json` version (e.g `1.12.3`)
    - update `desktop/package.json` to match that
    - run the following

    ```bash
    npm i && cd desktop && npm i && cd ..
    git add .
    git commit -m "v1.12.3"   # same as your package.json version but with a v in front
    git tag v1.12.3
    git push origin master --tags
    git push ahau master --tags   # the ahau-nz/ahau repo
    npm run release:desktop         # from the root folder

    # alternative for macOS >=12.3 (see details above)
    PYTHON_PATH=/path/to/python2 npm run release:desktop
    ```

    > NOTE: you can use `npm version` if you know how to use it and keep all the `package.json` versions lined up)

Compiles and minifies code (and assets) for production, builds installer (using compiled clientside code + back end code), and outputs to `./release/desktop`.

## Resources

- See : https://www.electron.build/code-signing for useful links

## Test installers

If you don't want to build and publish full installers you can manually run parts of the publishing process to inspect output, e.g.

- `npm run build-ui:desktop` (from root directory) makes a production build of ui
- `npm run dist` (in the desktop folder) takes built ui and this desktop folder and builds an installer (without auto-publishing)
  - if you want to skip notorization for Mac:
    - temporarily comment out the `afterSign` config in `desktop/electron-builder.config.js`
  - NOTE: if you have made changes to the UI, they wont be included in the installer, unless you have run `npm run build-ui:desktop` again.

Output won't be in `releases/desktop` rather `desktop/dist/installers`
