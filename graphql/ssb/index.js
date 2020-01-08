const GetProfile = require('./get-profile')

const run = require('promisify-tuple')

function p (fn) {
  return async function () {
    const [err, result] = await run(fn)(arguments)

    if (err) throw err
    else return result
  }
}

module.exports = function (sbot) {
  const getProfile = GetProfile(sbot)
  // start it up smart future cache and all

  return {
    getProfile: p(getProfile)
    // provide a promisify version of it!
  }
}
