# Ahau UI

Vue based front end used by desktop and mobile platforms

Built using tools:
    - vue-router
    - vuex
    - vue-apollo
    - vuetify
    - vue-i18n
    - d3

## Setup

```bash
$ npm install
```

## Development

```bash
$ npm run dev
```


### TODO

- package.json `browserslist`
    - keep this in step with electron version `cd desktop && npm ls electron`
    - :fire: mobile build will need something else
    - run `npx browerslist` to see what the rules resolve to!
- describe how these tools are used in concert
- upgrade to `d3@7`
    - full esm means out libs which use it for testing will need to go full esm
    - change test files to `*.test.mjs`
- upgrade to `storybook@6`
    - [migration docs >>](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#from-version-53x-to-60x)
