const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

module.exports.createOrMigrate = function createOrMigrate (basepath, appName, oldAppName) {
  const currentSsbPath = path.resolve(basepath, `.${appName}`)
  const currentExists = fs.existsSync(currentSsbPath)

  if (currentExists) {
    return
  }

  const oldSsbPath = path.resolve(basepath, `.${oldAppName}`)
  const oldExists = fs.existsSync(oldSsbPath)

  if (oldExists) {
    // rename config path
    fs.renameSync(oldSsbPath, currentSsbPath)
  } else {
    // create new config path
    mkdirp.sync(currentSsbPath)
  }
}
