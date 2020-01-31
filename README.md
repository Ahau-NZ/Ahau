# Āhau 

A whakapapa app that works peer-to-peer, and doesn't require internet.
All data is held by you and those friends you connect with, and is cryptographically secured.

Built on [scuttlebutt](www.scuttlebutt.nz)

For more info see ahau.io

## Setup

```bash
$ npm install
```

## Development

```bash
$ npm run serve
// start a webpack dev-server which serves up live-updating UI
```

Then in another terminal
```bash
$ npm run start:dev
// launches the scuttlebutt + graphql servers + electron
// which then asks for UI from dev-server
```

OTHER TOOLS
- [Graphiql](https://github.com/graphql/graphiql)
  - a sweet GraphQL tool for exploring generated doc and practicing queries/ mutations with the server
  - start the above dev environment then go to http://localhost:4000/graphql
- [Storybook](https://storybook.js.org/)
  - a tool to help you build components in isolation
  - start it with `npm run storybook`
  - serves up `*.stories.js` files

NOTES
- live-reload doesn't work for `ssb-server` (back end) code.
- Windows sets env differently. Open 2 Powershell windows and run the following in each:
  - `npm run serve`
  - `$env:NODE_ENV="development"`, then `npm start` (set the env to development, then launch electron app)

## Production Build

```bash
$ npm run build
```

Compiles and minifies code (and assets) for production, outputs to `./build`.
You can try running the build with `npm run start`.


## Publishing installers

```bash
$ npm run publish
```

Builds installer (using compiled clientside code + back end code), and outputs to `./dist/installers`.

NOTES
- **Mac needs**
  - Application Installer + Apllication certificates set up in your apple keychain for signing
  - an `electron-builder.env` with environment variables `APPLE_ID`, `APPLE_ID_PASS` for notarization, e.g :
     ```
     APPLE_ID=name@company.com
     APPLE_ID_PASS=asdl-tyan-osla-ttyb
     ```
    - `APPLE_ID_PASS` is an application specific password created from your `APPLE_ID`

- **Windows needs**
  - `build/win_csc.pfx` file
  - an `electron-builder.env` with environment variable `CSC_LINK` and `CSC_KEY_PASSWORD` (the password to the .pfx cert)
    ```
    CSC_LINK=build/win/csc.pfx
    CSC_KEY_PASSWORD=anliushfdxbaejhbrsajxhelaser
    ```

  - Mix bought the Signing Cerificate [here](https://docs.microsoft.com/en-us/windows-hardware/drivers/dashboard/get-a-code-signing-certificate?redirectedfrom=MSDN)
    - notes on aquiring + exporting :  
      - https://support.sectigo.com/Com_KnowledgeDetailPage?Id=kA01N000000zFK0#ie_export_certificate
      - this may need to be done from the same browser as you applied for the certificate from


### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

see also:

```
npm run test
npm run lint
```
