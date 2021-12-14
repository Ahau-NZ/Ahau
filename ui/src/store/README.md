# Vuex Guide

## Apollo

We use vuex to make apollo calls (e.g. createPerson).

If there is an error:

- we log an error to the console
- we return undefined

this means you should always check any returned value from vuex actions which make calls to apollo.

```js
const id = await this.createPerson(input)

if (!id) // handle fail case
```

_Note: this is an experiment started on 2021-12-14_

Principles:

- we want to know where an error came from
  - both inside vuex and from which component
