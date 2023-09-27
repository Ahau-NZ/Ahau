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

**NOTE**
- configure [vite-plugin-vue-inspector](https://github.com/webfansplz/vite-plugin-vue-inspector) !
- `browserslist` is currently set to the version of Electron we're using
    - this may need to change to support mobile builds in future
    - run `npx browserslist` to see what the current rules are resolving to (see package.json)

### TODO

- package.json `browserslist`
    - keep this in step with electron version `cd desktop && npm ls electron`
    - :fire: mobile build will need something else
    - run `npx browerslist` to see what the rules resolve to!
- describe how these tools are used in concert
