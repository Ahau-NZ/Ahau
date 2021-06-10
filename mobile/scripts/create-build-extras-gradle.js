const fs = require('fs')
const path = require('path')
module.exports = function (context) {
  const filePath = path.join(
    context.opts.projectRoot,
    'platforms',
    'android',
    'build-extras.gradle'
  )
  return fs.promises
    .writeFile(
      filePath,
      [
        'android.defaultConfig.ndk.abiFilters = ["armeabi-v7a", "arm64-v8a"] as Set<String>;'
      ].join('\n'),
      'utf-8'
    )
    .then(() => 'done')
}
