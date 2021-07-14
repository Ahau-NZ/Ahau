# Ahau Destkop

## Setup

```bash
$ npm run install
```

## Development 

Open two different terminals and run each in the following
- `cd ui && npm run dev`
- `cd desktop && npm run dev` (run this after the ui dev server is at 100%)

NOTES
- live-reload doesn't work for `ssb-server` (back end) code.


### Updating Icons

```
$ npm run build:icons
```
This takes icons from `desktop/build` and generates icon files specific for particular platforms (ico, icns)

## Publishing Installers

### All platforms need

- an `desktop/electron-builder.env` with environment variable `GH_TOKEN`
- each developer with publishing rights to `github.com/ahau-nz/ahau` needs to make their own token, make one [here](https://github.com/settings/tokens/new), selecting "repo" permissions
- an `ui/.env` with environment variable `MIXPANEL_TOKEN`

### Platform specific

**Mac needs**
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

**Windows needs**
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

**Linux needs**
_nothing!_


### Steps

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
$ git push github master --tags   # the ahau-nz/ahau repo
$ npm run release:desktop         # from the root folder
```

(you can use `npm version` if you know how to use it and keep all the `package.json` versions lined up)

Compiles and minifies code (and assets) for production, builds installer (using compiled clientside code + back end code), and outputs to `./release/desktop`.

RESOURCES
- See : https://www.electron.build/code-signing for useful links


### Test installers

If you don't want to build and publish full installers you can manually run parts of the publishing process to inpect output, e.g.

- `npm run build-ui:desktop` (from root directory) makes a production build of ui
- `npm run dist` (in this folder) takes built ui and this desktop folder and builds an installer (without auto-publishing)
    - if you run this command you don't have to rebuild the ui for production = faster!
    - if you want to skip signing, temporarily remove `elctron-builder.env` = faster!

Output won't be in `releases/desktop` rather `desktop/dist/installers`
