# NodeJS Project

This is the "backend" that cordova will run.

Note that the version of `nodejs-cordova-mobile` we run packages Node version `12.19.0`.
This is why we need to transpile some of our modules to work for that version of Node.


## Technical Debt

### sodium-native version

had to pin `sodium-native@3.2.0` so that it matches `sodium-native-nodejs-mobile@3.2.0-6`

To ensure this version is used everywhere, two modules were pinned to keep `sodium-native@3`:
```
  "devDependencies": {
    "noise-protocol": "3.0.1",
    "hmac-blake2b": "2.0.0"
  }
```

### ip

This module has a known vulnerability in version `v1.1.8`, this was patched in `v1.1.9`,
but unfortunately this introduced another bug! https://github.com/indutny/node-ip/issues/146

We should update this module later.


### NPM v6

this version is installing things stably, but:
- works with old lockfiles compared to rest of the repo

NPM v8 is the last version which works with Node 12.

In later versions the command `$(npm bin)/cpy args` has to be replaced with something like
`npm exec -- cpy args`


