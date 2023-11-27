const clone = require('lodash.clone')
const fs = require('fs')
const path = require('path')

const desktopPkg = require('../../../desktop/package.json')
const mobilePkg = require('./package.json')

const newMobilePkg = clone(mobilePkg)

Object.entries(desktopPkg.dependencies)
  .filter(([key, value]) => {
    if (key === 'secret-stack') return true
    if (key.startsWith('ssb') && key !== 'ssb-ahoy') return true
    if (key.startsWith('ahau')) return true

    console.log(' ✗', key)
    return false
  })
  .forEach(([key, value]) => {
    log(key, newMobilePkg.dependencies[key], value)
    newMobilePkg.dependencies[key] = value
  })

fs.writeFileSync(
  path.join(__dirname, 'package.json'),
  JSON.stringify(newMobilePkg, null, 2)
)

console.log(' DONE')
console.log(' Remember to npm instal')

function log (key, oldValue, newValue) {
  if (oldValue === newValue) console.log(green(' ✓'), key)
  else console.log(green(' ✓'), key, oldValue, '⇒', green(newValue))
}

function green (string) {
  return `\x1b[32m${string}\x1b[0m`
}
