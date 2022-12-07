# Ahau Destkop

## Requirements

- node: `v14.16.1` to `v15.0.0`
- npm: `v7.11.2` to `v8.0.0`

## Setup

```bash
$ npm install --engine-strict
```

> NOTE: the `engine-strict` flag will make sure you have the right version of `node` and `npm` installed

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

### Publishing Installers

- See [installers.md](/desktop/installers.md)
