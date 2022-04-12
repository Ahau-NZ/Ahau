# Āhau

A whakapapa app that works peer-to-peer, and doesn't require internet.
All data is held by you and those friends you connect with, and is cryptographically secured.

Built on [scuttlebutt](www.scuttlebutt.nz)

For more info see ahau.io

## Development

This repo is used for building desktop and mobile apps.
The `ui/` folder is common to both, while `desktop/` and `mobile/` folders contain setups specific to those platforms.

### Requirements

- node: `v14.16.1` to `v15.0.0`
- npm: `v7.11.2` to `v8.0.0`

```bash
$ npm install --engine-strict
// installs the ui (common to both projects) and some linting tools
```

> NOTE: the `engine-strict` flag will make sure you have the right version of `node` and `npm` installed

Then follow the documentation for target platform:

- desktop app : [desktop/README.md](./desktop/README.md)
- mobile app : [mobile/README.md](./mobile/README.md)



## Resources

- Vue
    - [Configuration Reference](https://cli.vuejs.org/config/).
- [Graphiql](https://github.com/graphql/graphiql)
    - a sweet GraphQL tool for exploring generated doc and practicing queries/ mutations with the server
    - start the above dev environment then go to http://localhost:4000/graphql
- [Storybook](https://storybook.js.org/)
    - a tool to help you build components in isolation
    - start it with `npm run storybook`
    - serves up `*.stories.js` files

- helper scipts
    ```
    npm run db:reset   // wipe dev identity
    npm run clear:all  // deletes node_modules from ./, ./ui, /desktop

    npm run lint       // lint whole project
    ```
    - see `package.json` for finer grained versions of these


## Troubleshooting

If `vue-cli-service` is not detected or recognised as a command, in the root folder run

```bash
$ npm cache clean -f
```

Following this, reinstall the required dependencies with

```bash
$ npm install
```

