# whakapapa-ora

## Setup

```bash
$ npm install
```

## Development

```bash
$ npm run dev
```
Launches electron app, connecting to a dev-server which is compiling and hot-reloading front-end (UI) code.

NOTES
- live-reload doesn't work for `ssb-server` (back end) code.
- Windows sets env differently. Open 2 Powershell windows and run the following in each:
  - `npm run serve` (starts the dev-server, which serves hot-reloading client-side code)
  - `$env:NODE_ENV="development"`, then `npm start` (set the env to development, then launch electron app)

## Production Build

```bash
$ npm run build
$ npm start
```

Compiles and minifies code (and assets) for production, outputs to `./dist`

```bash
$ npm run dist
```

Builds installer (using compiled clientside code + back end code), and outputs to `./dist/installers`.




### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

see also:

```
npm run test
npm run lint
```
